using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CampusServicesPortal.Migrations
{
    /// <inheritdoc />
    public partial class AddLastPasswordChangedAtToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'LastPasswordChangedAt')
                BEGIN
                    ALTER TABLE [dbo].[Users] ADD [LastPasswordChangedAt] datetime2 NULL;
                END

                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[FeeTypes]') AND name = 'IsActive')
                BEGIN
                    ALTER TABLE [dbo].[FeeTypes] ADD [IsActive] bit NOT NULL DEFAULT 1;
                END

                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PasswordHistories')
                BEGIN
                    CREATE TABLE [dbo].[PasswordHistories] (
                        [Id] int IDENTITY(1,1) NOT NULL,
                        [UserId] int NOT NULL,
                        [PasswordHash] nvarchar(max) NOT NULL,
                        [PasswordSalt] nvarchar(max) NOT NULL,
                        [CreatedAt] datetime2 NOT NULL,
                        CONSTRAINT [PK_PasswordHistories] PRIMARY KEY CLUSTERED ([Id] ASC),
                        CONSTRAINT [FK_PasswordHistories_Users_UserId] FOREIGN KEY([UserId]) REFERENCES [dbo].[Users] ([Id]) ON DELETE CASCADE
                    );
                    CREATE NONCLUSTERED INDEX [IX_PasswordHistories_UserId] ON [dbo].[PasswordHistories]([UserId] ASC);
                END

                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RefreshTokens')
                BEGIN
                    CREATE TABLE [dbo].[RefreshTokens] (
                        [Id] int IDENTITY(1,1) NOT NULL,
                        [UserId] int NOT NULL,
                        [Token] nvarchar(max) NOT NULL,
                        [ExpiresAt] datetime2 NOT NULL,
                        [CreatedAt] datetime2 NOT NULL,
                        [RevokedAt] datetime2 NULL,
                        [ReplacedByToken] nvarchar(max) NULL,
                        CONSTRAINT [PK_RefreshTokens] PRIMARY KEY CLUSTERED ([Id] ASC),
                        CONSTRAINT [FK_RefreshTokens_Users_UserId] FOREIGN KEY([UserId]) REFERENCES [dbo].[Users] ([Id]) ON DELETE CASCADE
                    );
                    CREATE NONCLUSTERED INDEX [IX_RefreshTokens_UserId] ON [dbo].[RefreshTokens]([UserId] ASC);
                END

                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'StudentPhoneNumbers')
                BEGIN
                    CREATE TABLE [dbo].[StudentPhoneNumbers] (
                        [Id] int IDENTITY(1,1) NOT NULL,
                        [StudentId] int NOT NULL,
                        [PhoneType] nvarchar(max) NOT NULL,
                        [PhoneNumber] nvarchar(max) NOT NULL,
                        [IsPrimary] bit NOT NULL,
                        [IsVerified] bit NOT NULL,
                        CONSTRAINT [PK_StudentPhoneNumbers] PRIMARY KEY CLUSTERED ([Id] ASC),
                        CONSTRAINT [FK_StudentPhoneNumbers_Students_StudentId] FOREIGN KEY([StudentId]) REFERENCES [dbo].[Students] ([Id]) ON DELETE CASCADE
                    );
                    CREATE NONCLUSTERED INDEX [IX_StudentPhoneNumbers_StudentId] ON [dbo].[StudentPhoneNumbers]([StudentId] ASC);
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PasswordHistories");

            migrationBuilder.DropTable(
                name: "RefreshTokens");

            migrationBuilder.DropTable(
                name: "StudentPhoneNumbers");

            migrationBuilder.DeleteData(
                table: "FeeTypes",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "SystemSettings",
                keyColumn: "SettingKey",
                keyValue: "LabBookingHoldMinutes");

            migrationBuilder.DeleteData(
                table: "SystemSettings",
                keyColumn: "SettingKey",
                keyValue: "MaxDailyLabBookings");

            migrationBuilder.DropColumn(
                name: "LastPasswordChangedAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "FeeTypes");

            migrationBuilder.AlterColumn<string>(
                name: "IndexNumber",
                table: "Students",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "FullName",
                table: "Students",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "ContactDetails",
                table: "Students",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "CertificateTypes",
                keyColumn: "Id",
                keyValue: 1,
                column: "Name",
                value: "Bonafide Certificate");

            migrationBuilder.UpdateData(
                table: "CertificateTypes",
                keyColumn: "Id",
                keyValue: 2,
                column: "Name",
                value: "Official Transcript");

            migrationBuilder.InsertData(
                table: "CertificateTypes",
                columns: new[] { "Id", "IsActive", "Name" },
                values: new object[] { 3, true, "Completion Letter" });

            migrationBuilder.UpdateData(
                table: "ComplaintCategories",
                keyColumn: "Id",
                keyValue: 1,
                column: "Name",
                value: "Hostel Maintenance");

            migrationBuilder.UpdateData(
                table: "ComplaintCategories",
                keyColumn: "Id",
                keyValue: 2,
                column: "Name",
                value: "Academic Issues");

            migrationBuilder.InsertData(
                table: "ComplaintCategories",
                columns: new[] { "Id", "IsActive", "Name" },
                values: new object[] { 3, true, "Network & Wi-Fi" });

            migrationBuilder.UpdateData(
                table: "Faculties",
                keyColumn: "Id",
                keyValue: 3,
                column: "Name",
                value: "Faculty of Business");

            migrationBuilder.UpdateData(
                table: "FeeTypes",
                keyColumn: "Id",
                keyValue: 2,
                column: "Name",
                value: "Semester Fee");

            migrationBuilder.UpdateData(
                table: "FeeTypes",
                keyColumn: "Id",
                keyValue: 3,
                column: "Name",
                value: "Exam Fee");

            migrationBuilder.UpdateData(
                table: "FeeTypes",
                keyColumn: "Id",
                keyValue: 4,
                column: "Name",
                value: "Lab Fine");

            migrationBuilder.InsertData(
                table: "Hostels",
                columns: new[] { "Id", "IsActive", "Name" },
                values: new object[,]
                {
                    { 1, true, "Jayathilake Hall (Boys)" },
                    { 2, true, "Sangamitta Hall (Girls)" }
                });

            migrationBuilder.InsertData(
                table: "Labs",
                columns: new[] { "Id", "Capacity", "IsActive", "LabType", "Name", "TotalColumns", "TotalRows" },
                values: new object[,]
                {
                    { 1, 30, true, "Computer", "Main Computer Lab 01", 6, 5 },
                    { 2, 20, true, "Science", "Chemistry Lab A", null, null }
                });

            migrationBuilder.InsertData(
                table: "StudentMasterLists",
                columns: new[] { "Id", "FacultyId", "FullName", "IndexNumber" },
                values: new object[,]
                {
                    { 1, 1, "Kamal Perera", "STU/2026/001" },
                    { 2, 2, "Nimal Silva", "STU/2026/002" },
                    { 3, 1, "Anusha Fernando", "STU/2026/003" }
                });

            migrationBuilder.InsertData(
                table: "SystemSettings",
                columns: new[] { "SettingKey", "SettingValue" },
                values: new object[] { "reservation-hold-minutes", "15" });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "IsActive", "PasswordHash", "Role" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 7, 31, 10, 5, 16, 712, DateTimeKind.Utc).AddTicks(4515), "admin@university.edu.lk", true, "$2a$11$qRzP42b3mY0b6uX8...", "Admin" },
                    { 2, new DateTime(2026, 7, 31, 10, 5, 16, 712, DateTimeKind.Utc).AddTicks(4519), "kamal@student.university.ac.lk", true, "$2a$11$w8h9x7y6z5u...", "Student" },
                    { 3, new DateTime(2026, 7, 31, 10, 5, 16, 712, DateTimeKind.Utc).AddTicks(4520), "nimal@student.university.ac.lk", true, "$2a$11$w8h9x7y6z5u...", "Student" },
                    { 4, new DateTime(2026, 7, 31, 10, 5, 16, 712, DateTimeKind.Utc).AddTicks(4522), "anusha@student.university.ac.lk", true, "$2a$11$w8h9x7y6z5u...", "Student" }
                });

            migrationBuilder.InsertData(
                table: "Venues",
                columns: new[] { "Id", "Capacity", "IsActive", "Name", "Type" },
                values: new object[,]
                {
                    { 1, 250, true, "Wimaladharma Main Auditorium", "Event Hall" },
                    { 2, 1000, true, "University Playground", "Open Space" },
                    { 3, 50, true, "Mini Seminar Room B", "Event Hall" }
                });

            migrationBuilder.InsertData(
                table: "Events",
                columns: new[] { "Id", "Capacity", "Description", "EndDateTime", "StartDateTime", "Title", "VenueId" },
                values: new object[,]
                {
                    { 1, 200, "Networking meet and greet.", new DateTime(2026, 9, 10, 16, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 9, 10, 9, 0, 0, 0, DateTimeKind.Utc), "Annual University Career Fair 2026", 1 },
                    { 2, 800, "Annual tournament.", new DateTime(2026, 10, 18, 18, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 10, 15, 8, 30, 0, 0, DateTimeKind.Utc), "Inter-Faculty Cricket Championship", 2 },
                    { 3, 45, "Guest lecture from industry specialists.", new DateTime(2026, 8, 20, 16, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 8, 20, 14, 0, 0, 0, DateTimeKind.Utc), "AI & Ethics Tech Talk", 3 }
                });

            migrationBuilder.InsertData(
                table: "LabSeats",
                columns: new[] { "Id", "ColumnIndex", "IsBroken", "LabId", "RowIndex", "SeatNumber" },
                values: new object[,]
                {
                    { 1, 0, false, 1, 0, "PC-01" },
                    { 2, 1, false, 1, 0, "PC-02" },
                    { 3, 3, false, 1, 0, "PC-03" },
                    { 4, 0, true, 1, 1, "PC-04" }
                });

            migrationBuilder.InsertData(
                table: "Rooms",
                columns: new[] { "Id", "HostelId", "IsActive", "MaxCapacity", "RoomNumber" },
                values: new object[,]
                {
                    { 1, 1, true, 4, "B-101" },
                    { 2, 1, true, 2, "B-102" },
                    { 3, 2, true, 4, "G-201" }
                });

            migrationBuilder.InsertData(
                table: "Students",
                columns: new[] { "Id", "ContactDetails", "DeactivatedAt", "EmailVerificationToken", "EmailVerificationTokenExpiresAt", "EmailVerified", "FacultyId", "FullName", "IndexNumber", "UserId" },
                values: new object[,]
                {
                    { 1, "+94771234567", null, null, null, true, 1, "Kamal Perera", "STU/2026/001", 2 },
                    { 2, "+94719876543", null, null, null, true, 2, "Nimal Silva", "STU/2026/002", 3 },
                    { 3, "+94751112223", null, null, null, true, 1, "Anusha Fernando", "STU/2026/003", 4 }
                });

            migrationBuilder.InsertData(
                table: "CertificateRequests",
                columns: new[] { "Id", "CertificateTypeId", "Reason", "RequestedAt", "Status", "StudentId" },
                values: new object[,]
                {
                    { 1, 1, "Required for visa application submission requirements.", new DateTime(2026, 7, 30, 10, 5, 16, 712, DateTimeKind.Utc).AddTicks(4673), "Pending", 1 },
                    { 2, 2, "Applying for a software engineering internship program.", new DateTime(2026, 7, 26, 10, 5, 16, 712, DateTimeKind.Utc).AddTicks(4674), "ReadyForCollection", 3 }
                });

            migrationBuilder.InsertData(
                table: "Complaints",
                columns: new[] { "Id", "CategoryId", "CreatedAt", "Description", "ResolutionNote", "Status", "StudentId" },
                values: new object[,]
                {
                    { 1, 1, new DateTime(2026, 7, 29, 10, 5, 16, 712, DateTimeKind.Utc).AddTicks(4648), "Room B-101 ceiling fan is vibrating aggressively and generating loud noises.", null, "Pending", 1 },
                    { 2, 3, new DateTime(2026, 7, 27, 10, 5, 16, 712, DateTimeKind.Utc).AddTicks(4655), "Wi-Fi connectivity is unavailable in the Engineering block common room area.", "IT department is assigning an engineer to inspect the access point router.", "In Progress", 2 }
                });

            migrationBuilder.InsertData(
                table: "FeePayments",
                columns: new[] { "Id", "Amount", "BillingPeriod", "Description", "FeeTypeId", "PaidAt", "Status", "StudentId" },
                values: new object[,]
                {
                    { 1, 45000.00m, "2026 - Sem 1", "Academic Tuition Fees", 1, new DateTime(2026, 7, 11, 10, 5, 16, 712, DateTimeKind.Utc).AddTicks(4708), "Paid", 1 },
                    { 2, 1500.00m, "2026 - Sem 1", "Fine issued for damaged computer mouse hardware.", 4, null, "Outstanding", 1 },
                    { 3, 5000.00m, "2026 - Sem 1", "General Amenities Fee run.", 2, null, "Outstanding", 2 },
                    { 4, 45000.00m, "2026 - Sem 1", "Academic Tuition Fees", 1, null, "Outstanding", 3 }
                });

            migrationBuilder.InsertData(
                table: "Notifications",
                columns: new[] { "Id", "CreatedAt", "IsRead", "Message", "StudentId", "Type" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 7, 30, 10, 5, 16, 712, DateTimeKind.Utc).AddTicks(4731), false, "An outstanding Lab Fine of LKR 1,500.00 has been assigned to your billing dashboard.", 1, "FeeAssignmentCreated" },
                    { 2, new DateTime(2026, 7, 31, 10, 5, 16, 712, DateTimeKind.Utc).AddTicks(4733), false, "Your Transcript request is ready for physical collection at the registrar office desk.", 3, "CertificateStatusUpdated" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Students_IndexNumber",
                table: "Students",
                column: "IndexNumber",
                unique: true);
        }
    }
}
