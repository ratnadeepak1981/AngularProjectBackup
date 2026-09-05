using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading.Tasks;
using CampusServicesPortal.DTOs.Requests.AuditLogs;
using CampusServicesPortal.DTOs.Responses.AuditLogs;
using CampusServicesPortal.Models;
using CampusServicesPortal.Repositories.Interfaces;
using CampusServicesPortal.Services.Interfaces;
using CampusServicesPortal.Wrappers;
using Microsoft.Extensions.Logging;

namespace CampusServicesPortal.Services.Implementations
{
    public class AuditLogService : IAuditLogService
    {
        private readonly IAuditLogRepository _auditLogRepository;
        private readonly ILogger<AuditLogService> _logger;
        private readonly Microsoft.AspNetCore.Http.IHttpContextAccessor _httpContextAccessor;

        private static readonly HashSet<string> SensitiveKeyWords = new(StringComparer.OrdinalIgnoreCase)
        {
            "password", "passwordhash", "passwordsalt", "token", "refreshtoken",
            "jwt", "otp", "mobileotpcode", "cvc", "cardnumber", "creditcard",
            "secret", "authorization", "securitystamp", "pin"
        };

        public AuditLogService(
            IAuditLogRepository auditLogRepository,
            ILogger<AuditLogService> logger,
            Microsoft.AspNetCore.Http.IHttpContextAccessor httpContextAccessor)
        {
            _auditLogRepository = auditLogRepository;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<ServiceResult<PagedAuditLogResultDto>> GetAuditLogsAsync(AuditLogFilterDto filter)
        {
            try
            {
                var result = await _auditLogRepository.GetAuditLogsAsync(filter);
                return ServiceResult<PagedAuditLogResultDto>.Success(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving audit logs with filter.");
                return ServiceResult<PagedAuditLogResultDto>.Failure("Failed to retrieve audit records.");
            }
        }

        public async Task<ServiceResult<AuditLogResponseDto>> GetAuditLogByIdAsync(long id)
        {
            try
            {
                var log = await _auditLogRepository.GetAuditLogByIdAsync(id);
                if (log == null)
                {
                    return ServiceResult<AuditLogResponseDto>.Failure("Audit log record not found.", 404);
                }

                var dto = new AuditLogResponseDto
                {
                    Id = log.Id,
                    UserId = log.UserId,
                    UserDisplayName = log.UserDisplayName,
                    Action = log.Action,
                    Module = log.Module,
                    EntityId = log.EntityId,
                    Timestamp = log.Timestamp,
                    IsSuccess = log.IsSuccess,
                    IsReviewed = log.IsReviewed,
                    ReviewedBy = log.ReviewedBy,
                    ReviewedAt = log.ReviewedAt,
                    IpAddress = log.IpAddress,
                    TraceId = log.TraceId,
                    Description = log.Description,
                    BeforeValuesJson = log.BeforeValuesJson,
                    AfterValuesJson = log.AfterValuesJson
                };

                return ServiceResult<AuditLogResponseDto>.Success(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving audit log by id {Id}.", id);
                return ServiceResult<AuditLogResponseDto>.Failure("Failed to retrieve audit log details.");
            }
        }

        public async Task<ServiceResult<bool>> MarkAsReviewedAsync(long id, string adminEmail)
        {
            try
            {
                var success = await _auditLogRepository.MarkAsReviewedAsync(id, adminEmail);
                if (!success)
                {
                    return ServiceResult<bool>.Failure("Audit log not found or already acknowledged.", 404);
                }
                return ServiceResult<bool>.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error acknowledging audit log {Id}.", id);
                return ServiceResult<bool>.Failure("Failed to acknowledge audit log incident.");
            }
        }

        public async Task<ServiceResult<int>> MarkAllAsReviewedAsync(string adminEmail)
        {
            try
            {
                var count = await _auditLogRepository.MarkAllAsReviewedAsync(adminEmail);
                return ServiceResult<int>.Success(count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error acknowledging all pending audit log incidents.");
                return ServiceResult<int>.Failure("Failed to acknowledge security incidents.");
            }
        }

        public async Task LogActivityAsync(
            int? userId,
            string? userDisplayName,
            string action,
            string module,
            string? entityId,
            string description,
            bool isSuccess = true,
            object? beforeValues = null,
            object? afterValues = null,
            string? ipAddress = null,
            string? traceId = null)
        {
            try
            {
                if (string.IsNullOrEmpty(ipAddress) && _httpContextAccessor?.HttpContext != null)
                {
                    ipAddress = _httpContextAccessor.HttpContext.Connection.RemoteIpAddress?.ToString();
                }
                if (string.IsNullOrEmpty(traceId) && _httpContextAccessor?.HttpContext != null)
                {
                    traceId = _httpContextAccessor.HttpContext.TraceIdentifier;
                }

                var beforeJson = SanitizeAndSerialize(beforeValues);
                var afterJson = SanitizeAndSerialize(afterValues);

                var log = new AuditLog
                {
                    UserId = userId,
                    UserDisplayName = userDisplayName,
                    Action = action,
                    Module = module,
                    EntityId = entityId,
                    Timestamp = DateTime.UtcNow,
                    IsSuccess = isSuccess,
                    IsReviewed = isSuccess, // Routine success is auto-reviewed; failures trigger actionable security alert
                    IpAddress = ipAddress,
                    TraceId = traceId,
                    Description = description,
                    BeforeValuesJson = beforeJson,
                    AfterValuesJson = afterJson
                };

                await _auditLogRepository.AddLogAsync(log);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to record audit log for action: {Action}, module: {Module}.", action, module);
            }
        }

        private static string? SanitizeAndSerialize(object? obj)
        {
            if (obj == null) return null;

            if (obj is string str)
            {
                try
                {
                    var parsed = JsonNode.Parse(str);
                    if (parsed != null)
                    {
                        SanitizeJsonNode(parsed);
                        return parsed.ToJsonString(new JsonSerializerOptions { WriteIndented = false });
                    }
                }
                catch
                {
                    return str;
                }
                return str;
            }

            try
            {
                var jsonString = JsonSerializer.Serialize(obj);
                var node = JsonNode.Parse(jsonString);
                if (node != null)
                {
                    SanitizeJsonNode(node);
                    return node.ToJsonString(new JsonSerializerOptions { WriteIndented = false });
                }
                return jsonString;
            }
            catch
            {
                return null;
            }
        }

        private static void SanitizeJsonNode(JsonNode node)
        {
            if (node is JsonObject obj)
            {
                var keysToRemoveOrMask = new List<string>();
                foreach (var prop in obj)
                {
                    if (IsSensitiveKey(prop.Key))
                    {
                        keysToRemoveOrMask.Add(prop.Key);
                    }
                    else if (prop.Value != null)
                    {
                        SanitizeJsonNode(prop.Value);
                    }
                }

                foreach (var key in keysToRemoveOrMask)
                {
                    obj[key] = "***REDACTED***";
                }
            }
            else if (node is JsonArray array)
            {
                foreach (var item in array)
                {
                    if (item != null)
                    {
                        SanitizeJsonNode(item);
                    }
                }
            }
        }

        private static bool IsSensitiveKey(string key)
        {
            foreach (var sensitive in SensitiveKeyWords)
            {
                if (key.IndexOf(sensitive, StringComparison.OrdinalIgnoreCase) >= 0)
                {
                    return true;
                }
            }
            return false;
        }
    }
}
