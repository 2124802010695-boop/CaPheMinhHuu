using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CaPheMinhHuu.Migrations
{
    /// <inheritdoc />
    public partial class AddCreatedByToBatch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "InventoryBatches",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "InventoryBatches");
        }
    }
}
