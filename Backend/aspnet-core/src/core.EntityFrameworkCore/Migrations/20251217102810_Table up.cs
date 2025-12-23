using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace core.Migrations
{
    /// <inheritdoc />
    public partial class Tableup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_QuoteHeaders_UserId",
                table: "QuoteHeaders",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_QuoteHeaders_AbpUsers_UserId",
                table: "QuoteHeaders",
                column: "UserId",
                principalTable: "AbpUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_QuoteHeaders_AbpUsers_UserId",
                table: "QuoteHeaders");

            migrationBuilder.DropIndex(
                name: "IX_QuoteHeaders_UserId",
                table: "QuoteHeaders");
        }
    }
}
