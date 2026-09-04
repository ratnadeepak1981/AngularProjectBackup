using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CampusServicesPortal.Migrations
{
    /// <inheritdoc />
    public partial class AddStudentPhoneNumbersAndAddresses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'StudentAddresses')
                BEGIN
                    CREATE TABLE [dbo].[StudentAddresses] (
                        [Id] int IDENTITY(1,1) NOT NULL,
                        [StudentId] int NOT NULL,
                        [AddressType] nvarchar(max) NOT NULL DEFAULT 'Permanent',
                        [AddressLine1] nvarchar(max) NOT NULL,
                        [AddressLine2] nvarchar(max) NULL,
                        [City] nvarchar(max) NOT NULL,
                        [DistrictOrProvince] nvarchar(max) NULL,
                        [PostalCode] nvarchar(max) NULL,
                        [Country] nvarchar(max) NOT NULL DEFAULT 'Sri Lanka',
                        [IsPrimary] bit NOT NULL DEFAULT 1,
                        CONSTRAINT [PK_StudentAddresses] PRIMARY KEY CLUSTERED ([Id] ASC),
                        CONSTRAINT [FK_StudentAddresses_Students_StudentId] FOREIGN KEY([StudentId]) REFERENCES [dbo].[Students] ([Id]) ON DELETE CASCADE
                    );
                    CREATE NONCLUSTERED INDEX [IX_StudentAddresses_StudentId] ON [dbo].[StudentAddresses]([StudentId] ASC);
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StudentAddresses");
        }
    }
}
