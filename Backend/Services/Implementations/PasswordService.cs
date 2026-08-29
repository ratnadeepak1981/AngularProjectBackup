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

        public PasswordService(IPasswordRepository passwordRepository)
        {
            _passwordRepository = passwordRepository;
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
                return ServiceResult<object>.Failure("Invalid, expired, or already used reset token pointer.", 400);

            var studentProfile = await _passwordRepository.GetStudentByIdAsync(tokenRecord.StudentId);
            var userProfile = studentProfile?.User;

            if (userProfile == null)
                return ServiceResult<object>.Failure("Target user credentials record was not found.", 404);

            userProfile.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            tokenRecord.IsUsed = true;

            await _passwordRepository.UpdateUserAsync(userProfile);
            await _passwordRepository.UpdateResetTokenStatusAsync(tokenRecord);
            await _passwordRepository.RevokeAllUserSessionsAsync(userProfile.Id);

            return ServiceResult<object>.Success(new { Message = "Password updated successfully! You can now log in." }, 200);
        }
    }
}
