using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CampusServicesPortal.Migrations
{
    /// <inheritdoc />
    public partial class AddCreatedAtToHostelApplications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF NOT EXISTS (
                    SELECT * FROM sys.columns 
                    WHERE object_id = OBJECT_ID(N'[dbo].[HostelApplications]') 
                    AND name = 'CreatedAt'
                )
                BEGIN
                    ALTER TABLE [dbo].[HostelApplications] ADD [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE());
                END
            ");
            migrationBuilder.Sql("UPDATE [HostelApplications] SET [CreatedAt] = '2026-07-31T10:05:16Z' WHERE [Id] IN (1, 2)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "HostelApplications");
        }
    }
}
