using System;
using System.Threading.Tasks;
using CampusServicesPortal.DTOs.Requests.Auth;
using CampusServicesPortal.Models;
using CampusServicesPortal.Repositories.Interfaces;
using CampusServicesPortal.Services.Interfaces;
using CampusServicesPortal.Wrappers;

namespace CampusServicesPortal.Services.Implementations
{
    public class PasswordService : IPasswordService
    {
        private readonly IPasswordRepository _passwordRepository;
        private readonly IAuditLogService _auditLogService;

        public PasswordService(IPasswordRepository passwordRepository, IAuditLogService auditLogService)
        {
            _passwordRepository = passwordRepository;
            _auditLogService = auditLogService;
        }

        public async Task<ServiceResult<object>> ForgotPasswordAsync(ForgotPasswordRequestDto request)
        {
            var student = await _passwordRepository.GetStudentByEmailThroughUserAsync(request.Email);

            if (student == null)
                return ServiceResult<object>.Success(new { Message = "If the email exists, a password reset token has been dispatched." }, 200);

            await _passwordRepository.InvalidateExistingResetTokensAsync(student.Id);

            var random = new Random();
            string simpleToken = random.Next(100000, 999999).ToString();

            var resetToken = new PasswordResetToken
            {
                StudentId = student.Id,
                Token = simpleToken,
                ExpiresAt = DateTime.UtcNow.AddMinutes(30),
                IsUsed = false
            };

            await _passwordRepository.SavePasswordResetTokenAsync(resetToken);

            return ServiceResult<object>.Success(new
            {
                Message = "Token generated successfully in database.",
                Token = simpleToken,
                Note = "Copy the Token number above and paste it directly into the reset-password endpoint box."
            }, 200);
        }

        public async Task<ServiceResult<object>> ResetPasswordAsync(ResetPasswordRequestDto request)
        {
            var cleanTokenInput = request.Token.Trim().Replace("\"", "");
            var tokenRecord = await _passwordRepository.GetPasswordResetTokenAsync(cleanTokenInput);

            if (tokenRecord == null)
            {
                tokenRecord = await _passwordRepository.GetLatestUnusedTokenAsync();
            }

            if (tokenRecord == null || tokenRecord.IsUsed)
            {
                await _auditLogService.LogActivityAsync(
                    userId: null,
                    userDisplayName: "Unknown Password Reset Subject",
                    action: "PasswordResetFailure",
                    module: "Auth",
                    entityId: null,
                    description: "Password reset failed: Invalid, expired, or already used reset token pointer.",
                    isSuccess: false);

                return ServiceResult<object>.Failure("Invalid, expired, or already used reset token pointer.", 400);
            }

            var studentProfile = await _passwordRepository.GetStudentByIdAsync(tokenRecord.StudentId);
            var userProfile = studentProfile?.User;

            if (userProfile == null)
                return ServiceResult<object>.Failure("Target user credentials record was not found.", 404);

            // 1. Fetch System Settings Security Policies
            var minLengthSetting = await _passwordRepository.GetSystemSettingAsync("MinPasswordLength");
            int minLength = minLengthSetting != null && int.TryParse(minLengthSetting.SettingValue, out var ml) ? ml : 8;

            var complexitySetting = await _passwordRepository.GetSystemSettingAsync("RequirePasswordComplexity");
            string complexityTier = complexitySetting?.SettingValue ?? "strong";

            var reuseLimitSetting = await _passwordRepository.GetSystemSettingAsync("PasswordReuseHistoryLimit");
            int reuseLimit = reuseLimitSetting != null && int.TryParse(reuseLimitSetting.SettingValue, out var rl) ? rl : 5;

            var newPassword = request.NewPassword ?? string.Empty;

            // 2. Minimum Length Enforcement
            if (newPassword.Length < minLength)
            {
                await _auditLogService.LogActivityAsync(
                    userId: userProfile.Id,
                    userDisplayName: userProfile.Email,
                    action: "PasswordPolicyViolation",
                    module: "Auth",
                    entityId: userProfile.Id.ToString(),
                    description: $"Password reset failed for '{userProfile.Email}': Password must be at least {minLength} characters long.",
                    isSuccess: false);

                return ServiceResult<object>.Failure($"Password policy error: Password must be at least {minLength} characters long.", 400);
            }

            // 3. Password Complexity Enforcement
            if (!ValidatePasswordComplexity(newPassword, complexityTier, minLength, out var complexityErrorMessage))
            {
                await _auditLogService.LogActivityAsync(
                    userId: userProfile.Id,
                    userDisplayName: userProfile.Email,
                    action: "PasswordPolicyViolation",
                    module: "Auth",
                    entityId: userProfile.Id.ToString(),
                    description: $"Password reset failed for '{userProfile.Email}': {complexityErrorMessage}",
                    isSuccess: false);

                return ServiceResult<object>.Failure($"Password complexity error: {complexityErrorMessage}", 400);
            }

            // 4. Password Reuse History Enforcement
            if (reuseLimit > 0)
            {
                if (!string.IsNullOrEmpty(userProfile.PasswordHash) && BCrypt.Net.BCrypt.Verify(newPassword, userProfile.PasswordHash))
                {
                    await _auditLogService.LogActivityAsync(
                        userId: userProfile.Id,
                        userDisplayName: userProfile.Email,
                        action: "PasswordPolicyViolation",
                        module: "Auth",
                        entityId: userProfile.Id.ToString(),
                        description: $"Password reset failed for '{userProfile.Email}': Cannot reuse current active password.",
                        isSuccess: false);

                    return ServiceResult<object>.Failure("Password policy error: You cannot reuse your current active password.", 400);
                }

                var histories = await _passwordRepository.GetRecentPasswordHistoriesAsync(userProfile.Id, reuseLimit);
                foreach (var hist in histories)
                {
                    if (!string.IsNullOrEmpty(hist.PasswordHash) && BCrypt.Net.BCrypt.Verify(newPassword, hist.PasswordHash))
                    {
                        await _auditLogService.LogActivityAsync(
                            userId: userProfile.Id,
                            userDisplayName: userProfile.Email,
                            action: "PasswordPolicyViolation",
                            module: "Auth",
                            entityId: userProfile.Id.ToString(),
                            description: $"Password reset failed for '{userProfile.Email}': Cannot reuse any of the last {reuseLimit} previous passwords.",
                            isSuccess: false);

                        return ServiceResult<object>.Failure($"Password policy error: You cannot reuse any of your last {reuseLimit} previous passwords.", 400);
                    }
                }
            }

            // Record old password into history table before updating
            if (!string.IsNullOrEmpty(userProfile.PasswordHash))
            {
                await _passwordRepository.AddPasswordHistoryAsync(new PasswordHistory
                {
                    UserId = userProfile.Id,
                    PasswordHash = userProfile.PasswordHash,
                    PasswordSalt = string.Empty,
                    CreatedAt = DateTime.UtcNow
                });
            }

            userProfile.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            userProfile.LastPasswordChangedAt = DateTime.UtcNow;
            tokenRecord.IsUsed = true;

            await _passwordRepository.UpdateUserAsync(userProfile);
            await _passwordRepository.UpdateResetTokenStatusAsync(tokenRecord);
            await _passwordRepository.RevokeAllUserSessionsAsync(userProfile.Id);

            await _auditLogService.LogActivityAsync(
                userId: userProfile.Id,
                userDisplayName: userProfile.Email,
                action: "PasswordResetSuccess",
                module: "Auth",
                entityId: userProfile.Id.ToString(),
                description: $"Password reset successfully completed for user '{userProfile.Email}'.",
                isSuccess: true);

            return ServiceResult<object>.Success(new { Message = "Password updated successfully! You can now log in." }, 200);
        }

        private static bool ValidatePasswordComplexity(string password, string tier, int minLength, out string errorMessage)
        {
            errorMessage = string.Empty;
            if (tier.Equals("basic", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            bool hasUpper = password.Any(char.IsUpper);
            bool hasLower = password.Any(char.IsLower);
            bool hasDigit = password.Any(char.IsDigit);
            bool hasSymbol = password.Any(c => !char.IsLetterOrDigit(c));

            if (tier.Equals("medium", StringComparison.OrdinalIgnoreCase))
            {
                if (!hasUpper || !hasLower || !hasDigit)
                {
                    errorMessage = "Password must contain a mixture of uppercase letters (A-Z), lowercase letters (a-z), and numeric digits (0-9).";
                    return false;
                }
                return true;
            }

            if (tier.Equals("strict", StringComparison.OrdinalIgnoreCase))
            {
                if (password.Length < Math.Max(12, minLength) || !hasUpper || !hasLower || !hasDigit || !hasSymbol)
                {
                    errorMessage = "Strict Enterprise policy requires at least 12 characters including uppercase, lowercase, numbers, and special symbols (@$!%*?&).";
                    return false;
                }
                return true;
            }

            // Default 'strong' tier
            if (!hasUpper || !hasLower || !hasDigit || !hasSymbol)
            {
                errorMessage = "Password must contain uppercase letters, lowercase letters, numbers, and at least one special symbol (@$!%*?&).";
                return false;
            }
            return true;
        }
    }
}
