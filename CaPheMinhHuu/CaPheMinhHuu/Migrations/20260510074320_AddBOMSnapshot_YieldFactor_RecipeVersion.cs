using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CaPheMinhHuu.Migrations
{
    /// <inheritdoc />
    public partial class AddBOMSnapshot_YieldFactor_RecipeVersion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Recipes",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "Recipes",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<decimal>(
                name: "YieldFactor",
                table: "Recipes",
                type: "decimal(5,4)",
                nullable: false,
                defaultValue: 1.0m);

            migrationBuilder.CreateTable(
                name: "OrderItemIngredientSnapshots",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderItemId = table.Column<int>(type: "int", nullable: false),
                    IngredientId = table.Column<int>(type: "int", nullable: false),
                    IngredientName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BaseUnit = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    QuantityRequired = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    YieldFactor = table.Column<decimal>(type: "decimal(5,4)", nullable: false),
                    RecipeVersion = table.Column<int>(type: "int", nullable: false),
                    SizeMultiplier = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    OrderQuantity = table.Column<int>(type: "int", nullable: false),
                    ActualDeducted = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderItemIngredientSnapshots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderItemIngredientSnapshots_OrderItems_OrderItemId",
                        column: x => x.OrderItemId,
                        principalTable: "OrderItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OrderItemIngredientSnapshots_OrderItemId",
                table: "OrderItemIngredientSnapshots",
                column: "OrderItemId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItemIngredientSnapshots_OrderItemId_IngredientId",
                table: "OrderItemIngredientSnapshots",
                columns: new[] { "OrderItemId", "IngredientId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OrderItemIngredientSnapshots");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "YieldFactor",
                table: "Recipes");
        }
    }
}
