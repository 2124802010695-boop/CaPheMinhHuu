using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CaPheMinhHuu.Migrations
{
    /// <inheritdoc />
    public partial class RemoveTabIdUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ActiveSessions_TabId",
                table: "ActiveSessions");

            migrationBuilder.CreateIndex(
                name: "IX_ActiveSessions_TabId",
                table: "ActiveSessions",
                column: "TabId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ActiveSessions_TabId",
                table: "ActiveSessions");

            migrationBuilder.CreateIndex(
                name: "IX_ActiveSessions_TabId",
                table: "ActiveSessions",
                column: "TabId",
                unique: true);
        }
    }
}
