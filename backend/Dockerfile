FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY PetPortal.sln .
COPY PetPortal.Api/PetPortal.Api.csproj PetPortal.Api/
COPY PetPortal.Tests/PetPortal.Tests.csproj PetPortal.Tests/
RUN dotnet restore PetPortal.Api/PetPortal.Api.csproj

COPY PetPortal.Api/. PetPortal.Api/
RUN dotnet publish PetPortal.Api/PetPortal.Api.csproj -c Release -o /out /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /out .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "PetPortal.Api.dll"]
