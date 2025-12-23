using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace core.Migrations
{
    /// <inheritdoc />
    public partial class Tables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "QuoteHeaders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    Mobile = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AddressLine1 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AddressLine2 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorUserId = table.Column<long>(type: "bigint", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierUserId = table.Column<long>(type: "bigint", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeleterUserId = table.Column<long>(type: "bigint", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuoteHeaders", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SolarProducts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Watt = table.Column<int>(type: "int", nullable: false),
                    BasePrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Subsidy = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SolarProducts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QuoteItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    QuoteHeaderId = table.Column<int>(type: "int", nullable: false),
                    SolarProductId = table.Column<int>(type: "int", nullable: false),
                    CalculatedPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsApproved = table.Column<bool>(type: "bit", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorUserId = table.Column<long>(type: "bigint", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierUserId = table.Column<long>(type: "bigint", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeleterUserId = table.Column<long>(type: "bigint", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuoteItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuoteItems_QuoteHeaders_QuoteHeaderId",
                        column: x => x.QuoteHeaderId,
                        principalTable: "QuoteHeaders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QuoteItems_SolarProducts_SolarProductId",
                        column: x => x.SolarProductId,
                        principalTable: "SolarProducts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClientOrders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    QuoteItemId = table.Column<int>(type: "int", nullable: false),
                    OrderDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    OrderStatus = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorUserId = table.Column<long>(type: "bigint", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierUserId = table.Column<long>(type: "bigint", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeleterUserId = table.Column<long>(type: "bigint", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientOrders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClientOrders_QuoteItems_QuoteItemId",
                        column: x => x.QuoteItemId,
                        principalTable: "QuoteItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ClientOrders_QuoteItemId",
                table: "ClientOrders",
                column: "QuoteItemId");

            migrationBuilder.CreateIndex(
                name: "IX_QuoteItems_QuoteHeaderId",
                table: "QuoteItems",
                column: "QuoteHeaderId");

            migrationBuilder.CreateIndex(
                name: "IX_QuoteItems_SolarProductId",
                table: "QuoteItems",
                column: "SolarProductId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClientOrders");

            migrationBuilder.DropTable(
                name: "QuoteItems");

            migrationBuilder.DropTable(
                name: "QuoteHeaders");

            migrationBuilder.DropTable(
                name: "SolarProducts");
        }
    }
}
