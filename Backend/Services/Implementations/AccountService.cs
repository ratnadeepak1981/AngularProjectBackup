using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CampusServicesPortal.DTOs.Requests.Auth;
using CampusServicesPortal.DTOs.Responses.Auth;
using CampusServicesPortal.Repositories.Interfaces;
using CampusServicesPortal.Services.Interfaces;
using CampusServicesPortal.Wrappers;

namespace CampusServicesPortal.Services.Implementations
{
    public class AccountService : IAccountService
    {
        private readonly IAccountRepository _accountRepository;

        public AccountService(IAccountRepository accountRepository)
        {
            _accountRepository = accountRepository;
        }

        public async Task<ServiceResult<bool>> VerifyEmailAsync(VerifyEmailRequestDto request)
        {
            var student = await _accountRepository.GetStudentByVerificationTokenAsync(request.Token);
            if (student == null)
                return ServiceResult<bool>.Failure("Invalid or expired email verification token.", 400);

            DateTime emailExpiresAtUtc = DateTime.SpecifyKind(student.EmailVerificationTokenExpiresAt ?? DateTime.MinValue, DateTimeKind.Utc);
            if (emailExpiresAtUtc < DateTime.UtcNow)
                return ServiceResult<bool>.Failure("Invalid or expired email verification token.", 400);

            student.EmailVerified = true;
            student.EmailVerificationToken = null;
            student.EmailVerificationTokenExpiresAt = null;

            await _accountRepository.UpdateStudentAsync(student);
            return ServiceResult<bool>.Success(true, 200);
        }

        public async Task<ServiceResult<bool>> ResendVerificationEmailAsync(ResendVerificationRequestDto request)
        {
            var student = await _accountRepository.GetStudentByEmailThroughUserAsync(request.Email);

            if (student == null)
                return ServiceResult<bool>.Success(true, 200);

            if (student.EmailVerified)
                return ServiceResult<bool>.Failure("This account has already been verified and is active.", 400);

            student.EmailVerificationToken = Guid.NewGuid().ToString("N");
            student.EmailVerificationTokenExpiresAt = DateTime.UtcNow.AddHours(24);

            await _accountRepository.UpdateStudentAsync(student);

            return ServiceResult<bool>.Success(true, 200);
        }

        public async Task<ServiceResult<DeactivationCheckResponseDto>> CheckDeactivationEligibilityAsync(int studentId)
        {
            var reasons = new List<string>();

            if (await _accountRepository.HasActiveHostelRoomAsync(studentId))
                reasons.Add("Student currently holds active hostel room assignments.");

            if (await _accountRepository.HasUpcomingLabBookingsAsync(studentId))
                reasons.Add("Student has upcoming future-dated laboratory bookings.");

            if (await _accountRepository.HasUpcomingEventRegistrationsAsync(studentId))
                reasons.Add("Student is registered for upcoming university events.");

            if (await _accountRepository.HasPendingCertificateRequestsAsync(studentId))
                reasons.Add("Student has an outstanding certificate issuance request processing.");

            if (await _accountRepository.HasOutstandingFeesAsync(studentId))
                reasons.Add("Student has outstanding unpaid fee balances or pending fines.");

            var response = new DeactivationCheckResponseDto
            {
                CanDeactivate = reasons.Count == 0,
                BlockingReasons = reasons
            };

            return ServiceResult<DeactivationCheckResponseDto>.Success(response, 200);
        }

        public async Task<ServiceResult<object>> DeactivateAccountAsync(int studentId)
        {
            var student = await _accountRepository.GetStudentByIdAsync(studentId);
            if (student == null)
                return ServiceResult<object>.Failure("Target student account profile record was not found.", 404);

            var eligibility = await CheckDeactivationEligibilityAsync(studentId);
            if (!eligibility.Data.CanDeactivate)
            {
                return ServiceResult<object>.Failure($"Deactivation Blocked: {string.Join(" ", eligibility.Data.BlockingReasons)}", 400);
            }

            await _accountRepository.DeactivateStudentAccountAsync(studentId);
            return ServiceResult<object>.Success(new { Message = "Student portal account deactivated safely." }, 200);
        }

        public async Task<ServiceResult<object>> ReactivateAccountAsync(int studentId)
        {
            var student = await _accountRepository.GetStudentByIdAsync(studentId);
            if (student == null)
                return ServiceResult<object>.Failure("Target student account profile record was not found.", 404);

            await _accountRepository.ReactivateStudentAccountAsync(studentId);
            return ServiceResult<object>.Success(new { Message = "Student account profile has been reactivated successfully." }, 200);
        }
    }
}
