using CampusServicesPortal.DTOs.Requests.Certificates;
using CampusServicesPortal.DTOs.Requests.Nortifcation;
using CampusServicesPortal.DTOs.Responses.Certificates;
using CampusServicesPortal.Models;
using CampusServicesPortal.Repositories.Interfaces;
using CampusServicesPortal.Services.Interfaces;
using CampusServicesPortal.Wrappers;

namespace CampusServicesPortal.Services.Implementations
{
    public class CertificateService : ICertificateService
    {
        private readonly ICertificateRepository _certificateRepository;
        // 1. ADDED FIELD VARIABLE:
        private readonly INotificationService _notificationService;

        // 2. UPDATED CONSTRUCTOR METHOD SIGNATURE:
        public CertificateService(ICertificateRepository certificateRepository, INotificationService notificationService)
        {
            _certificateRepository = certificateRepository;
            _notificationService = notificationService; // Assigned service dependency
        }

        public async Task<ServiceResult<CertificateResponseDto>>
            RequestCertificateAsync(
                int studentId,
                SubmitCertificateRequestDto request)
        {
            bool studentExists =
                await _certificateRepository
                    .StudentExistsAsync(studentId);

            if (!studentExists)
            {
                return ServiceResult<CertificateResponseDto>
                    .Failure("Student not found.", 404);
            }

            var certificateType =
                await _certificateRepository
                    .GetCertificateTypeByIdAsync(
                        request.CertificateTypeId);

            if (certificateType == null)
            {
                return ServiceResult<CertificateResponseDto>
                    .Failure(
                        "Certificate type not found.",
                        404);
            }

            if (!certificateType.IsActive)
            {
                return ServiceResult<CertificateResponseDto>
                    .Failure(
                        "The selected certificate type is inactive.",
                        400);
            }

            if (string.IsNullOrWhiteSpace(request.Reason))
            {
                return ServiceResult<CertificateResponseDto>
                    .Failure(
                        "Certificate request reason is required.",
                        400);
            }

            bool duplicatePendingRequest =
                await _certificateRepository
                    .HasPendingDuplicateAsync(
                        studentId,
                        request.CertificateTypeId);

            if (duplicatePendingRequest)
            {
                return ServiceResult<CertificateResponseDto>
                    .Failure(
                        "A pending request already exists for this certificate type.",
                        409);
            }

            var certificateRequest = new CertificateRequest
            {
                StudentId = studentId,
                CertificateTypeId =
                    request.CertificateTypeId,
                Reason = request.Reason.Trim(),
                Status = "Pending",
                RequestedAt = DateTime.UtcNow
            };

            await _certificateRepository
                .AddRequestAsync(certificateRequest);

            await _certificateRepository
                .SaveChangesAsync();

            var savedRequest =
                await _certificateRepository
                    .GetRequestByIdAsync(
                        certificateRequest.Id);

            var response =
                MapCertificate(
                    savedRequest ?? certificateRequest);

            return ServiceResult<CertificateResponseDto>
                .Success(response, 201);
        }

        public async Task<ServiceResult<
            IEnumerable<CertificateResponseDto>>>
            GetStudentRequestsAsync(int studentId)
        {
            bool studentExists =
                await _certificateRepository
                    .StudentExistsAsync(studentId);

            if (!studentExists)
            {
                return ServiceResult<
                    IEnumerable<CertificateResponseDto>>
                    .Failure("Student not found.", 404);
            }

            var requests =
                await _certificateRepository
                    .GetRequestsByStudentIdAsync(studentId);

            var response = requests
                .Select(MapCertificate)
                .ToList();

            return ServiceResult<
                IEnumerable<CertificateResponseDto>>
                .Success(response, 200);
        }

        public async Task<ServiceResult<
            IEnumerable<CertificateResponseDto>>>
            GetRequestsAsync(string? status)
        {
            string? normalizedStatus = null;

            if (!string.IsNullOrWhiteSpace(status))
            {
                normalizedStatus =
                    NormalizeStatus(status);

                if (normalizedStatus == null)
                {
                    return ServiceResult<
                        IEnumerable<CertificateResponseDto>>
                        .Failure(
                            "Status must be Pending, Approved, Rejected, or Ready for Collection.",
                            400);
                }
            }

            var requests =
                await _certificateRepository
                    .GetRequestsAsync(normalizedStatus);

            var response = requests
                .Select(MapCertificate)
                .ToList();

            return ServiceResult<
                IEnumerable<CertificateResponseDto>>
                .Success(response, 200);
        }

        public async Task<ServiceResult<CertificateResponseDto>> UpdateRequestStatusAsync(int requestId, UpdateCertificateStatusDto request)
        {
            var certificateRequest = await _certificateRepository.GetRequestByIdAsync(requestId);
            if (certificateRequest == null)
            {
                return ServiceResult<CertificateResponseDto>.Failure("Certificate request not found.", 404);
            }

            string? nextStatus = NormalizeStatus(request.Status);
            if (nextStatus == null)
            {
                return ServiceResult<CertificateResponseDto>.Failure("Status must be Pending, Approved, Rejected, or Ready for Collection.", 400);
            }

            string currentStatus = NormalizeStatus(certificateRequest.Status) ?? certificateRequest.Status;
            bool validTransition = IsValidStatusTransition(currentStatus, nextStatus);

            if (!validTransition)
            {
                return ServiceResult<CertificateResponseDto>.Failure($"Invalid status change from '{currentStatus}' to '{nextStatus}'.", 400);
            }

            // 1. Progress the workflow status properties in memory
            certificateRequest.Status = nextStatus;

            // =========================================================================
            // 🚀 AUTOMATED TRIGGER: Emits notification when marked ready for pickup
            // =========================================================================
            if (nextStatus == "Ready for Collection")
            {
                string docType = certificateRequest.CertificateType?.Name ?? "Requested Document";

                // Call the decoupled internal notification service pipeline
                await _notificationService.SendInternalNotificationAsync(new CreateNotificationDto
                {
                    StudentId = certificateRequest.StudentId, // Links cleanly to the affected student profile index
                    Type = "CertificateReadyForCollection",
                    Message = $"Your official request for a '{docType}' has been signed off and processed. It is now ready for physical collection at the Student Registrar counter office."
                });
            }
            // =========================================================================

            // 2. ACID ATOMIC COMMIT TRIP
            await _certificateRepository.SaveChangesAsync();

            return ServiceResult<CertificateResponseDto>.Success(MapCertificate(certificateRequest), 200);
        }



        private static CertificateResponseDto
            MapCertificate(
                CertificateRequest certificateRequest)
        {
            return new CertificateResponseDto
            {
                Id = certificateRequest.Id,
                StudentId =
                    certificateRequest.StudentId,
                StudentName =
                    certificateRequest.Student?.FullName
                    ?? string.Empty,
                CertificateTypeId =
                    certificateRequest.CertificateTypeId,
                CertificateTypeName =
                    certificateRequest.CertificateType?.Name
                    ?? string.Empty,
                Reason = certificateRequest.Reason,
                Status =
                    NormalizeStatus(
                        certificateRequest.Status)
                    ?? certificateRequest.Status,
                RequestedAt =
                    certificateRequest.RequestedAt
            };
        }

        private static string?
            NormalizeStatus(string status)
        {
            return status
                .Trim()
                .ToLowerInvariant() switch
            {
                "pending" => "Pending",

                "approved" => "Approved",

                "rejected" => "Rejected",

                "ready for collection" =>
                    "Ready for Collection",

                "readyforcollection" =>
                    "Ready for Collection",

                _ => null
            };
        }

        private static bool IsValidStatusTransition(
            string currentStatus,
            string nextStatus)
        {
            return
                (currentStatus == "Pending" &&
                 nextStatus == "Approved")
                ||
                (currentStatus == "Pending" &&
                 nextStatus == "Rejected")
                ||
                (currentStatus == "Approved" &&
                 nextStatus == "Ready for Collection");
        }
    }
}