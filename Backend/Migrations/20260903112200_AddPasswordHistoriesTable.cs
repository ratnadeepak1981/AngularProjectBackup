using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CampusServicesPortal.Migrations
{
    /// <inheritdoc />
    public partial class AddPasswordHistoriesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'LastPasswordChangedAt')
                BEGIN
                    ALTER TABLE [dbo].[Users] ADD [LastPasswordChangedAt] datetime2 NULL DEFAULT (GETUTCDATE());
                END

                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PasswordHistories')
                BEGIN
                    CREATE TABLE [dbo].[PasswordHistories] (
                        [Id] int IDENTITY(1,1) NOT NULL,
                        [UserId] int NOT NULL,
                        [PasswordHash] nvarchar(max) NOT NULL,
                        [PasswordSalt] nvarchar(max) NOT NULL,
                        [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
                        CONSTRAINT [PK_PasswordHistories] PRIMARY KEY CLUSTERED ([Id] ASC),
                        CONSTRAINT [FK_PasswordHistories_Users_UserId] FOREIGN KEY([UserId]) REFERENCES [dbo].[Users] ([Id]) ON DELETE CASCADE
                    );
                    CREATE NONCLUSTERED INDEX [IX_PasswordHistories_UserId] ON [dbo].[PasswordHistories]([UserId] ASC);
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PasswordHistories");

            migrationBuilder.DropColumn(
                name: "LastPasswordChangedAt",
                table: "Users");
        }
    }
}
