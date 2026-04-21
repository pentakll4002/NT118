using Backend.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260420183000_AddUserAddressLocation")]
public partial class AddUserAddressLocation : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "formatted_address",
            table: "user_addresses",
            type: "character varying(500)",
            maxLength: 500,
            nullable: true);

        migrationBuilder.AddColumn<double>(
            name: "latitude",
            table: "user_addresses",
            type: "double precision",
            nullable: true);

        migrationBuilder.AddColumn<double>(
            name: "longitude",
            table: "user_addresses",
            type: "double precision",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "poi_name",
            table: "user_addresses",
            type: "character varying(200)",
            maxLength: 200,
            nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "formatted_address", table: "user_addresses");
        migrationBuilder.DropColumn(name: "latitude", table: "user_addresses");
        migrationBuilder.DropColumn(name: "longitude", table: "user_addresses");
        migrationBuilder.DropColumn(name: "poi_name", table: "user_addresses");
    }
}

