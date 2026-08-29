using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CampusServicesPortal.DTOs.Requests.Billing; // Matches your exact request DTO namespace [INDEX]
using CampusServicesPortal.DTOs.Responses.Billing;
using CampusServicesPortal.DTOs.Requests.Nortifcation; // Maps cleanly to your CreateNotificationDto parameter model [INDEX]
using CampusServicesPortal.Models;
using CampusServicesPortal.Repositories.Interfaces;
using CampusServicesPortal.Services.Interfaces;
using CampusServicesPortal.Wrappers;

namespace CampusServicesPortal.Services.Implementations
{
    public class BillingService : IBillingService
    {
        private readonly IBillingRepository _billingRepo;
        // Injecting centralized notification service contract architecture layer [INDEX]
        private readonly INotificationService _notificationService;

        public BillingService(IBillingRepository billingRepo, INotificationService notificationService)
        {
            _billingRepo = billingRepo;
            _notificationService = notificationService;
        }

        /// <summary>
        /// POST: Maps AssignFeeDto to distribute either individual student billing records or faculty group bulk arrays.
        /// </summary>
        public async Task<ServiceResult<object>> AssignFeeAsync(AssignFeeDto request)
        {
            if (!request.StudentId.HasValue && !request.FacultyId.HasValue)
            {
                return ServiceResult<object>.Failure("Invalid Assignment Scope. Supply either a StudentId or a FacultyId.", 400);
            }

            string formattedAmount = request.Amount.ToString("N2");
            string billingPeriodClean = request.BillingPeriod.Trim();
            string? descriptionClean = request.Description?.Trim();

            if (request.StudentId.HasValue)
            {
                int studentId = request.StudentId.Value;

                bool isDuplicate = await _billingRepo.HasDuplicateUnpaidFeeAsync(studentId, request.FeeTypeId, billingPeriodClean);
                if (isDuplicate)
                {
                    return ServiceResult<object>.Failure($"Duplicate Invoice Rejected. An outstanding invoice already exists for this student for period '{billingPeriodClean}'.", 400);
                }

                var feePayment = new FeePayment
                {
                    StudentId = studentId,
                    FeeTypeId = request.FeeTypeId,
                    Amount = request.Amount,
                    BillingPeriod = billingPeriodClean,
                    Description = descriptionClean,
                    Status = "Outstanding"
                };

                await _billingRepo.AddFeePaymentAsync(feePayment);

                // AUTOMATED TRIGGER: Stage single-student notification inside the transaction context cache [INDEX]
                await _notificationService.SendInternalNotificationAsync(new CreateNotificationDto
                {
                    StudentId = studentId,
                    Type = "NewFeeAssigned",
                    Message = $"New Invoice Issued: An outstanding university charge (Period: {billingPeriodClean}) amounting to LKR {formattedAmount} has been posted to your account."
                });

                await _billingRepo.SaveChangesAsync();

                var completeRecord = await _billingRepo.GetFeePaymentByIdAsync(feePayment.Id);
                return ServiceResult<object>.Success(MapToResponseDto(completeRecord!), 201);
            }
            else
            {
                int facultyId = request.FacultyId!.Value;

                var studentCohortList = await _billingRepo.GetStudentsByFacultyIdAsync(facultyId);
                if (studentCohortList == null || !studentCohortList.Any())
                {
                    return ServiceResult<object>.Failure("No active student records matched the target faculty group selection filter.", 404);
                }

                foreach (var student in studentCohortList)
                {
                    bool hasDuplicate = await _billingRepo.HasDuplicateUnpaidFeeAsync(student.Id, request.FeeTypeId, billingPeriodClean);
                    if (hasDuplicate) continue;

                    var feePayment = new FeePayment
                    {
                        StudentId = student.Id,
                        FeeTypeId = request.FeeTypeId,
                        Amount = request.Amount,
                        BillingPeriod = billingPeriodClean,
                        Description = descriptionClean,
                        Status = "Outstanding"
                    };

                    await _billingRepo.AddFeePaymentAsync(feePayment);

                    // AUTOMATED TRIGGER: Loop and stage individual notifications for bulk cohorts concurrently [INDEX]
                    await _notificationService.SendInternalNotificationAsync(new CreateNotificationDto
                    {
                        StudentId = student.Id,
                        Type = "NewFeeAssigned",
                        Message = $"New Invoice Issued: An outstanding institutional charge (Period: {billingPeriodClean}) has been posted to your account ledger. Amount: LKR {formattedAmount}."
                    });
                }

                await _billingRepo.SaveChangesAsync();
                return ServiceResult<object>.Success(new { Message = "Bulk assignment run completed successfully." }, 201);
            }
        }

        /// <summary>
        /// POST: Generates an individual library/lab penalty sanction charge fine record [INDEX].
        /// </summary>
        public async Task<ServiceResult<object>> IssueLabFineAsync(GenerateLabFineDto request)
        {
            var feePayment = new FeePayment
            {
                StudentId = request.StudentId,
                FeeTypeId = 4, // Defaults to your system's master Lab Fine Type Id database row entry [INDEX]
                Amount = request.Amount,
                BillingPeriod = DateTime.UtcNow.Year.ToString() + " - Fine",
                Description = request.Reason.Trim(), // Maps cleanly to your model's Reason property field
                Status = "Outstanding"
            };

            await _billingRepo.AddFeePaymentAsync(feePayment);

            // AUTOMATED TRIGGER: Stage lab fine alert inside your shared transaction memory pool [INDEX]
            string formattedAmount = request.Amount.ToString("N2");
            await _notificationService.SendInternalNotificationAsync(new CreateNotificationDto
            {
                StudentId = request.StudentId, // Securely targets exclusively the single affected student account profile [INDEX]
                Type = "NewFeeAssigned",
                Message = $"Penalty Notice: A laboratory fine amounting to LKR {formattedAmount} has been added to your profile ledger. Reason: \"{feePayment.Description}\"."
            });

            await _billingRepo.SaveChangesAsync();

            var completeRecord = await _billingRepo.GetFeePaymentByIdAsync(feePayment.Id);
            return ServiceResult<object>.Success(MapToResponseDto(completeRecord!), 201);
        }

        /// <summary>
        /// PUT: Simulates marking an outstanding fee as settled [INDEX].
        /// </summary>
        public async Task<ServiceResult<FeePaymentResponseDto>> ProcessPaymentAsync(int paymentId, int studentId)
        {
            // FIXED: Param sequences aligned perfectly with your IBillingService layout contract (paymentId, studentId)
            var feePayment = await _billingRepo.GetFeePaymentByIdAsync(paymentId);
            if (feePayment == null || feePayment.StudentId != studentId)
            {
                return ServiceResult<FeePaymentResponseDto>.Failure("Target statement invoice record not found.", 404);
            }

            if (feePayment.Status.Equals("Paid", StringComparison.OrdinalIgnoreCase))
            {
                return ServiceResult<FeePaymentResponseDto>.Failure("Transaction Aborted. This specific invoice balance has already been settled.", 400);
            }

            // Progress tracking variables inside tracking context memory
            feePayment.Status = "Paid";
            feePayment.PaidAt = DateTime.UtcNow;

            // AUTOMATED TRIGGER: Emit successful settlement transaction alert notification [INDEX]
            string feeName = feePayment.FeeType?.Name ?? "Institutional Charge";
            await _notificationService.SendInternalNotificationAsync(new CreateNotificationDto
            {
                StudentId = studentId,
                Type = "FeePaymentSettled",
                Message = $"Payment Confirmed! Your transaction clearing LKR {feePayment.Amount.ToString("N2")} for '{feeName}' has been successfully verified."
            });

            await _billingRepo.SaveChangesAsync();
            return ServiceResult<FeePaymentResponseDto>.Success(MapToResponseDto(feePayment), 200);
        }

        /// <summary>
        /// GET: Compiles outstanding statements ledger summary charts [INDEX].
        /// </summary>
        public async Task<ServiceResult<IEnumerable<FeePaymentResponseDto>>> GetStudentLedgerAsync(int studentId)
        {
            var historyRecords = await _billingRepo.GetOutstandingFeesByStudentIdAsync(studentId);
            var mappedDtos = historyRecords.Select(MapToResponseDto);
            return ServiceResult<IEnumerable<FeePaymentResponseDto>>.Success(mappedDtos, 200);
        }

        private static FeePaymentResponseDto MapToResponseDto(FeePayment src)
        {
            return new FeePaymentResponseDto
            {
                Id = src.Id,
                StudentId = src.StudentId,
                FeeTypeName = src.FeeType?.Name ?? "General University Fee",
                Amount = src.Amount,
                BillingPeriod = src.BillingPeriod,
                Description = src.Description,
                Status = src.Status,
                PaidAt = src.PaidAt
            };
        }
    }
}