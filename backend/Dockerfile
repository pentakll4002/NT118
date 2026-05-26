FROM mcr.microsoft.com/dotnet/sdk:10.0 AS builder

WORKDIR /src

COPY ["backend.csproj", "."]

RUN dotnet restore "backend.csproj"

COPY . .

RUN dotnet build "backend.csproj" -c Release -o /app/build

FROM builder AS publish

RUN dotnet publish "backend.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0

WORKDIR /app

# Copy published app
COPY --from=publish /app/publish .

# Copy data.json for address seeding (if exists)
COPY --from=builder /src/data.jso[n] ./

ENV ASPNETCORE_ENVIRONMENT=Production \
    ASPNETCORE_URLS=http://+:5058

EXPOSE 5058

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5058/health || exit 1

ENTRYPOINT ["dotnet", "backend.dll"]
