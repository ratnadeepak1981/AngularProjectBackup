using CampusServicesPortal.DTOs.Requests.Auth;
using CampusServicesPortal.DTOs.Requests.Student;
using CampusServicesPortal.DTOs.Responses.Student;
using CampusServicesPortal.Models;
using CampusServicesPortal.Repositories.Interfaces;
using CampusServicesPortal.Services.Interfaces;
using CampusServicesPortal.Wrappers;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CampusServicesPortal.Services.Implementations
{
    public class StudentService : IStudentService
    {
        private readonly IStudentRepository _studentRepository;
        private readonly IPasswordRepository _passwordRepository;

        public StudentService(IStudentRepository studentRepository, IPasswordRepository passwordRepository)
        {
            _studentRepository = studentRepository;
            _passwordRepository = passwordRepository;
        }

        // POST /api/students/register [BRD Section 4 - Module 1]
        public async Task<ServiceResult<StudentProfileResponseDto>> RegisterStudentAsync(RegisterStudentRequestDto request)
        {
            // 1. Gate check: Verify if index number exists in the pre-approved university registrar file [BRD Rule 5]
            var masterRecord = await _studentRepository.GetMasterRecordAsync(request.IndexNumber);
            if (masterRecord == null)
            {
                return ServiceResult<StudentProfileResponseDto>.Failure("Registration rejected: Index number is not found in the university master list.", 400);
            }

            // 2. Duplication check: Verify if an account has already claimed this index number [BRD Section 4]
            bool isIndexTaken = await _studentRepository.IsIndexRegisteredAsync(request.IndexNumber);
            if (isIndexTaken)
            {
                return ServiceResult<StudentProfileResponseDto>.Failure("Registration rejected: An account has already been registered with this index number.", 409);
            }

            // 3. Email check: Enforce parameter uniqueness across data records [BRD Section 4]
            bool isEmailTaken = await _studentRepository.IsEmailRegisteredAsync(request.Email);
            if (isEmailTaken)
            {
                return ServiceResult<StudentProfileResponseDto>.Failure("Registration rejected: Email address is already in use.", 409);
            }

            // 3.5 Password Policy Validation
            var minLengthSetting = await _passwordRepository.GetSystemSettingAsync("MinPasswordLength");
            int minLength = minLengthSetting != null && int.TryParse(minLengthSetting.SettingValue, out var ml) ? ml : 8;

            var complexitySetting = await _passwordRepository.GetSystemSettingAsync("RequirePasswordComplexity");
            string complexityTier = complexitySetting?.SettingValue ?? "strong";

            var rawPassword = request.Password ?? string.Empty;
            if (rawPassword.Length < minLength)
            {
                return ServiceResult<StudentProfileResponseDto>.Failure($"Password policy error: Password must be at least {minLength} characters long.", 400);
            }

            if (!ValidatePasswordComplexity(rawPassword, complexityTier, minLength, out var complexityErrorMessage))
            {
                return ServiceResult<StudentProfileResponseDto>.Failure($"Password complexity error: {complexityErrorMessage}", 400);
            }

            // 4. Secure Hashing: Generate cryptographically safe salted password hash [BRD Section 10]
            string securePasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // 5. MANUAL MAPPING: Instantiate structural database fields exactly matching your schema
            var newStudent = new CampusServicesPortal.Models.Student
            {
                IndexNumber = masterRecord.IndexNumber,
                FullName = masterRecord.FullName, // Pulls authoritative trusted name from university master list
                ContactDetails = request.ContactDetails,
                EmailVerified = false, // Remains false until out-of-band token confirmation occurs [BRD Rule 16]
                FacultyId = request.FacultyId,
                EmailVerificationToken = Guid.NewGuid().ToString(),
                EmailVerificationTokenExpiresAt = DateTime.UtcNow.AddHours(24),
                DeactivatedAt = null,

                User = new CampusServicesPortal.Models.User
                {
                    Email = request.Email,
                    PasswordHash = securePasswordHash,
                    Role = "Student",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                }
            };

            await _studentRepository.AddStudentAsync(newStudent);
            await _studentRepository.SaveChangesAsync();

            // 6. Response Mapping
            var profileResponse = new StudentProfileResponseDto
            {
                Id = newStudent.Id,
                IndexNumber = newStudent.IndexNumber,
                Name = newStudent.FullName,
                Email = request.Email,
                ContactDetails = newStudent.ContactDetails,
                EmailVerified = newStudent.EmailVerified,
                IsActive = true,
                FacultyName = "Assigned Profile"
            };

            return ServiceResult<StudentProfileResponseDto>.Success(profileResponse, 201);
        }

        // GET /api/students/{id} [BRD Section 4 - Module 1]
        public async Task<ServiceResult<StudentProfileResponseDto>> GetStudentProfileAsync(int id)
        {
            var student = await _studentRepository.GetByIdAsync(id);
            if (student == null)
            {
                return ServiceResult<StudentProfileResponseDto>.Failure("Student profile not found.", 404);
            }

            var response = new StudentProfileResponseDto
            {
                Id = student.Id,
                IndexNumber = student.IndexNumber,
                Name = student.FullName,
                Email = student.User?.Email ?? string.Empty,
                ContactDetails = student.ContactDetails,
                EmailVerified = student.EmailVerified,
                IsActive = !student.DeactivatedAt.HasValue && (student.User == null || student.User.IsActive),
                FacultyName = student.Faculty?.Name ?? "Unassigned"
            };

            return ServiceResult<StudentProfileResponseDto>.Success(response, 200);
        }

        // PUT /api/students/{id} [BRD Section 4 - Module 1]
        public async Task<ServiceResult<StudentProfileResponseDto>> UpdateStudentProfileAsync(int id, UpdateStudentProfileDto request)
        {
            var student = await _studentRepository.GetByIdAsync(id);
            if (student == null)
            {
                return ServiceResult<StudentProfileResponseDto>.Failure("Student profile not found.", 404);
            }

            // Business Rule: Students cannot edit their own index number once registered [BRD Section 4]
            student.ContactDetails = request.ContactDetails;
            student.FacultyId = request.FacultyId;

            await _studentRepository.UpdateAsync(student);
            await _studentRepository.SaveChangesAsync();

            return await GetStudentProfileAsync(id);
        }

        // GET /api/students?search=&faculty= [BRD Section 4 - Module 1]
        public async Task<ServiceResult<IEnumerable<StudentProfileResponseDto>>> SearchStudentsAsync(string? search, string? faculty)
        {
            var students = await _studentRepository.SearchStudentsAsync(search, faculty);
            var resultList = new List<StudentProfileResponseDto>();

            foreach (var student in students)
            {
                resultList.Add(new StudentProfileResponseDto
                {
                    Id = student.Id,
                    IndexNumber = student.IndexNumber,
                    Name = student.FullName,
                    Email = student.User?.Email ?? string.Empty,
                    ContactDetails = student.ContactDetails,
                    EmailVerified = student.EmailVerified,
                    IsActive = !student.DeactivatedAt.HasValue && (student.User == null || student.User.IsActive),
                    FacultyName = student.Faculty?.Name ?? "Unassigned"
                });
            }

            return ServiceResult<IEnumerable<StudentProfileResponseDto>>.Success(resultList, 200);
        }

        // DELETE /api/students/{id} (Deactivate Action) [BRD Rule 11]
        public async Task<ServiceResult<bool>> DeactivateStudentAsync(int id)
        {
            // 1. Core Rule Check: Safely inspect ongoing obligations across blocks before deactivation [BRD Rule 11]
            if (await _studentRepository.HasActiveHostelAllocationAsync(id) ||
                await _studentRepository.HasUpcomingLabBookingsAsync(id) ||
                await _studentRepository.HasUpcomingEventRegistrationsAsync(id) ||
                await _studentRepository.HasPendingCertificateRequestAsync(id) ||
                await _studentRepository.HasUnpaidFeesAsync(id))
            {
                return ServiceResult<bool>.Failure("Cannot deactivate student with active items.", 400);
            }


            var student = await _studentRepository.GetByIdAsync(id);
            if (student == null)
            {
                return ServiceResult<bool>.Failure("Student not found.", 404);
            }

            student.DeactivatedAt = DateTime.UtcNow;
            if (student.User != null)
            {
                student.User.IsActive = false; // Performs soft deactivation across identity mapping
            }

            await _studentRepository.UpdateAsync(student);
            await _studentRepository.SaveChangesAsync();

            return ServiceResult<bool>.Success(true, 200);
        }

        // GET /api/student-master/{indexNumber} Validation & Pre-fill Logic [BRD Page 4]
        public async Task<ServiceResult<object>> VerifyMasterIndexAsync(string indexNumber)
        {
            var decodedIndex = Uri.UnescapeDataString(indexNumber);
            var masterRecord = await _studentRepository.GetMasterRecordAsync(decodedIndex);

            // Rule 1: Reject registration if index number is not in master list [Index 0.1.4]
            if (masterRecord == null)
            {
                return ServiceResult<object>.Failure("Registration rejected: Index number is not found in the university master list.", 404);
            }

            // Rule 2: Master records can only be linked to one single student profile [Index 0.1.4]
            bool isAlreadyRegistered = await _studentRepository.IsIndexRegisteredAsync(decodedIndex);
            if (isAlreadyRegistered)
            {
                return ServiceResult<object>.Failure("Registration rejected: This index number has already been used to create an account.", 400);
            }

            // Return fields safely to allow client-side pre-fill automation [Index 0.1.4]
            return ServiceResult<object>.Success(new
            {
                indexNumber = masterRecord.IndexNumber,
                fullName = masterRecord.FullName,
                facultyId = masterRecord.FacultyId
            }, 200);
        }

        // GET /api/student-master?search= Admin Verification Module [BRD Page 4]
        public async Task<ServiceResult<IEnumerable<object>>> SearchMasterRecordsAsync(string? search)
        {
            var records = await _studentRepository.SearchMasterListAsync(search);
            var registeredIndices = await _studentRepository.GetRegisteredIndexNumbersAsync();

            var result = records.Select(r => new
            {
                r.Id,
                r.IndexNumber,
                r.FullName,
                r.FacultyId,
                IsUsed = registeredIndices.Contains(r.IndexNumber.ToLower())
            });

            return ServiceResult<IEnumerable<object>>.Success(result, 200);
        }

        // POST /api/student-master/import Administrative Stream Parser [BRD Page 4]
        public async Task<ServiceResult<int>> BulkImportMasterRecordsAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return ServiceResult<int>.Failure("Please upload a valid CSV file data payload.", 400);
            }

            var masterRecordsList = new List<StudentMasterList>();

            try
            {
                using var reader = new System.IO.StreamReader(file.OpenReadStream());
                // Skip structural CSV text metadata header row
                await reader.ReadLineAsync();

                while (!reader.EndOfStream)
                {
                    var line = await reader.ReadLineAsync();
                    if (string.IsNullOrWhiteSpace(line)) continue;

                    var parts = line.Split(',');
                    if (parts.Length >= 3)
                    {
                        masterRecordsList.Add(new StudentMasterList
                        {
                            IndexNumber = parts[0].Trim(),
                            FullName = parts[1].Trim(),
                            FacultyId = int.Parse(parts[2].Trim())
                        });
                    }
                }

                await _studentRepository.BulkImportMasterListAsync(masterRecordsList);
                await _studentRepository.SaveChangesAsync();

                return ServiceResult<int>.Success(masterRecordsList.Count, 200);
            }
            catch (Exception ex)
            {
                return ServiceResult<int>.Failure($"An error occurred during file parsing: {ex.Message}", 500);
            }
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
