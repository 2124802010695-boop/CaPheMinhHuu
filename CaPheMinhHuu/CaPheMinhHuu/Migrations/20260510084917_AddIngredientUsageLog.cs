using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CaPheMinhHuu.Migrations
{
    /// <inheritdoc />
    public partial class AddIngredientUsageLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "IngredientUsageLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderId = table.Column<int>(type: "int", nullable: false),
                    OrderItemId = table.Column<int>(type: "int", nullable: false),
                    OrderCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OrderDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    BatchId = table.Column<int>(type: "int", nullable: true),
                    BatchCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BatchImportDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IngredientId = table.Column<int>(type: "int", nullable: false),
                    IngredientName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BaseUnit = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CostPerBaseUnit = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    DeductedQty = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    TotalCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TheoreticalQty = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    Variance = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    RecipeVersion = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IngredientUsageLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IngredientUsageLogs_InventoryBatches_BatchId",
                        column: x => x.BatchId,
                        principalTable: "InventoryBatches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_IngredientUsageLogs_BatchId",
                table: "IngredientUsageLogs",
                column: "BatchId");

            migrationBuilder.CreateIndex(
                name: "IX_IngredientUsageLogs_IngredientId",
                table: "IngredientUsageLogs",
                column: "IngredientId");

            migrationBuilder.CreateIndex(
                name: "IX_IngredientUsageLogs_IngredientId_OrderDate",
                table: "IngredientUsageLogs",
                columns: new[] { "IngredientId", "OrderDate" });

            migrationBuilder.CreateIndex(
                name: "IX_IngredientUsageLogs_OrderDate",
                table: "IngredientUsageLogs",
                column: "OrderDate");

            migrationBuilder.CreateIndex(
                name: "IX_IngredientUsageLogs_OrderId",
                table: "IngredientUsageLogs",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_IngredientUsageLogs_OrderId_IngredientId",
                table: "IngredientUsageLogs",
                columns: new[] { "OrderId", "IngredientId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "IngredientUsageLogs");
        }
    }
}
