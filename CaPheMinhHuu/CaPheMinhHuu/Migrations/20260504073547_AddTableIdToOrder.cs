using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CaPheMinhHuu.Migrations
{
    /// <inheritdoc />
    public partial class AddTableIdToOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tables_Orders_CurrentOrderId",
                table: "Tables");

            migrationBuilder.DropIndex(
                name: "IX_Tables_CurrentOrderId",
                table: "Tables");

            migrationBuilder.DropColumn(
                name: "CurrentOrderId",
                table: "Tables");

            migrationBuilder.AlterColumn<int>(
                name: "TableNumber",
                table: "Orders",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "TableId",
                table: "Orders",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_TableId",
                table: "Orders",
                column: "TableId");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Tables_TableId",
                table: "Orders",
                column: "TableId",
                principalTable: "Tables",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Tables_TableId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_TableId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "TableId",
                table: "Orders");

            migrationBuilder.AddColumn<int>(
                name: "CurrentOrderId",
                table: "Tables",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "TableNumber",
                table: "Orders",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tables_CurrentOrderId",
                table: "Tables",
                column: "CurrentOrderId");

            migrationBuilder.AddForeignKey(
                name: "FK_Tables_Orders_CurrentOrderId",
                table: "Tables",
                column: "CurrentOrderId",
                principalTable: "Orders",
                principalColumn: "Id");
        }
    }
}
