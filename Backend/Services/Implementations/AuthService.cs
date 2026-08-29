using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using CampusServicesPortal.DTOs.Requests.Auth;
using CampusServicesPortal.DTOs.Responses.Auth;
using CampusServicesPortal.DTOs.Responses.Student;
using CampusServicesPortal.Models;
using CampusServicesPortal.Repositories.Interfaces;
using CampusServicesPortal.Services.Interfaces;
using CampusServicesPortal.Wrappers;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace CampusServicesPortal.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepository;
        private readonly IConfiguration _config;

        public AuthService(IAuthRepository authRepository, IConfiguration config)
        {
            _authRepository = authRepository;
            _config = config;
        }

        public async Task<ServiceResult<AuthResponseDto>> LoginAsync(LoginRequestDto request)
        {
            var user = await _authRepository.GetUserByEmailAsync(request.Email);

            if (user == null || !VerifyPasswordHash(request.Password, user.PasswordHash))
                return ServiceResult<AuthResponseDto>.Failure("Invalid login credentials provided.", 401);

            var student = await _authRepository.GetStudentByUserIdWithFacultyAsync(user.Id);

            if (user.Role == "Student" && student != null)
            {
                if (!student.EmailVerified)
                    return ServiceResult<AuthResponseDto>.Failure("Access Denied. Your email address has not been verified yet.", 403);

                if (student.DeactivatedAt.HasValue)
                    return ServiceResult<AuthResponseDto>.Failure("Authentication Failed. This student portal account has been deactivated.", 403);
            }

            var tokenString = GenerateJwtToken(user, student?.Id ?? 0);
            var refreshTokenString = GenerateSecureRandomToken();

            var refreshTokenEntity = new RefreshToken
            {
                UserId = user.Id,
                Token = refreshTokenString,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                CreatedAt = DateTime.UtcNow
            };

            await _authRepository.SaveRefreshTokenAsync(refreshTokenEntity);

            var response = new AuthResponseDto
            {
                Token = tokenString,
                RefreshToken = refreshTokenString,
                Role = user.Role,
                Profile = new StudentProfileResponseDto
                {
                    Id = student?.Id ?? 0,
                    IndexNumber = student?.IndexNumber ?? "N/A",
                    Name = student?.FullName ?? "Administrator Account",
                    Email = user.Email,
                    FacultyName = student?.Faculty?.Name ?? "Central Administration",
                    ContactDetails = student?.ContactDetails,
                    EmailVerified = student?.EmailVerified ?? false,
                    IsActive = !student?.DeactivatedAt.HasValue ?? user.IsActive
                }
            };

            return ServiceResult<AuthResponseDto>.Success(response, 200);
        }

        public async Task<ServiceResult<AuthResponseDto>> RefreshTokenAsync(RefreshTokenRequestDto request)
        {
            var existingToken = await _authRepository.GetRefreshTokenAsync(request.RefreshToken);

            if (existingToken == null)
                return ServiceResult<AuthResponseDto>.Failure("Invalid refresh token supplied.", 401);

            if (!existingToken.IsActive)
                return ServiceResult<AuthResponseDto>.Failure("Expired or revoked refresh token. Please sign in again.", 401);

            var user = existingToken.User;
            if (user == null || !user.IsActive)
                return ServiceResult<AuthResponseDto>.Failure("Associated user account is deactivated.", 403);

            var student = await _authRepository.GetStudentByUserIdWithFacultyAsync(user.Id);
            if (user.Role == "Student" && student != null && student.DeactivatedAt.HasValue)
                return ServiceResult<AuthResponseDto>.Failure("Associated student account has been deactivated.", 403);

            // Execute Refresh Token Rotation: Revoke old token and issue new token pair
            var newRefreshTokenString = GenerateSecureRandomToken();
            existingToken.RevokedAt = DateTime.UtcNow;
            existingToken.ReplacedByToken = newRefreshTokenString;

            await _authRepository.UpdateRefreshTokenAsync(existingToken);

            var newRefreshTokenEntity = new RefreshToken
            {
                UserId = user.Id,
                Token = newRefreshTokenString,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                CreatedAt = DateTime.UtcNow
            };

            await _authRepository.SaveRefreshTokenAsync(newRefreshTokenEntity);

            var newJwtToken = GenerateJwtToken(user, student?.Id ?? 0);

            var response = new AuthResponseDto
            {
                Token = newJwtToken,
                RefreshToken = newRefreshTokenString,
                Role = user.Role,
                Profile = new StudentProfileResponseDto
                {
                    Id = student?.Id ?? 0,
                    IndexNumber = student?.IndexNumber ?? "N/A",
                    Name = student?.FullName ?? "Administrator Account",
                    Email = user.Email,
                    FacultyName = student?.Faculty?.Name ?? "Central Administration",
                    ContactDetails = student?.ContactDetails,
                    EmailVerified = student?.EmailVerified ?? false,
                    IsActive = !student?.DeactivatedAt.HasValue ?? user.IsActive
                }
            };

            return ServiceResult<AuthResponseDto>.Success(response, 200);
        }

        public async Task<ServiceResult<bool>> RevokeTokenAsync(RevokeTokenRequestDto request)
        {
            var tokenEntity = await _authRepository.GetRefreshTokenAsync(request.RefreshToken);
            if (tokenEntity == null || !tokenEntity.IsActive)
                return ServiceResult<bool>.Failure("Invalid or already revoked refresh token.", 400);

            tokenEntity.RevokedAt = DateTime.UtcNow;
            await _authRepository.UpdateRefreshTokenAsync(tokenEntity);

            return ServiceResult<bool>.Success(true, 200);
        }

        private string GenerateJwtToken(User user, int studentId)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? throw new InvalidOperationException("JWT Secret Key is not configured."));

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Role == "Student" ? studentId.ToString() : user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(60), // standard access token window
                Issuer = _config["Jwt:Issuer"],
                Audience = _config["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private string GenerateSecureRandomToken()
        {
            var randomBytes = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            return Convert.ToBase64String(randomBytes);
        }

        private bool VerifyPasswordHash(string password, string storedHash)
        {
            return BCrypt.Net.BCrypt.Verify(password, storedHash);
        }
    }
}
