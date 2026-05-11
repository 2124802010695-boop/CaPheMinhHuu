using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CaPheMinhHuu.Migrations
{
    /// <inheritdoc />
    public partial class AddPurchaseUnitToBatch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "PurchaseQuantity",
                table: "InventoryBatches",
                type: "decimal(18,3)",
                precision: 18,
                scale: 3,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PurchaseUnitId",
                table: "InventoryBatches",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_InventoryBatches_PurchaseUnitId",
                table: "InventoryBatches",
                column: "PurchaseUnitId");

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryBatches_IngredientUnits_PurchaseUnitId",
                table: "InventoryBatches",
                column: "PurchaseUnitId",
                principalTable: "IngredientUnits",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InventoryBatches_IngredientUnits_PurchaseUnitId",
                table: "InventoryBatches");

            migrationBuilder.DropIndex(
                name: "IX_InventoryBatches_PurchaseUnitId",
                table: "InventoryBatches");

            migrationBuilder.DropColumn(
                name: "PurchaseQuantity",
                table: "InventoryBatches");

            migrationBuilder.DropColumn(
                name: "PurchaseUnitId",
                table: "InventoryBatches");
        }
    }
}
