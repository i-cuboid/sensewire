﻿// Copyright (c) Microsoft. All rights reserved.

using System;
using System.Threading.Tasks;
using Microsoft.Azure.IoTSolutions.AsaManager.Services.Diagnostics;
using Microsoft.Azure.IoTSolutions.AsaManager.Services.Exceptions;
using Microsoft.Azure.IoTSolutions.AsaManager.Services.Runtime;

namespace Microsoft.Azure.IoTSolutions.AsaManager.Services.Storage
{
    public interface IAsaStorage
    {
        void Initialize(AsaOutputStorageType outputStorageType, CosmosDbTableConfiguration config);
        Task SetupOutputStorageAsync();
    }

    public class AsaStorage : IAsaStorage
    {
        private readonly IFactory factory;
        private readonly ILogger log;
        private AsaOutputStorageType storageType;
        private CosmosDbTableConfiguration cosmosDbConfig;
        private MongoDbTableConfiguration mongoDbCong;
        private bool initialized;

        public AsaStorage(
            IFactory factory,
            ILogger logger)
        {
            this.factory = factory;
            this.log = logger;
            this.initialized = false;
        }

        public void Initialize(
            AsaOutputStorageType outputStorageType,
            CosmosDbTableConfiguration config)
        {
            this.storageType = outputStorageType;
            this.cosmosDbConfig = config;
            this.initialized = true;
        }

        public async Task SetupOutputStorageAsync()
        {
            if (!this.initialized)
            {
                // Note: this is an application bug
                this.log.Error("Initialize() not invoked yet.", () => { });
                throw new ApplicationException("Initialize() not invoked yet.");
            }

            try
            {
                if (this.storageType == AsaOutputStorageType.CosmosDbSql)
                {
                    this.mongoDbCong = new MongoDbTableConfiguration();
                    this.mongoDbCong.Collection = this.cosmosDbConfig.Collection;
                    this.mongoDbCong.ConnectionString = this.cosmosDbConfig.ConnectionString;
                    this.mongoDbCong.Database = this.cosmosDbConfig.Database;
                    this.mongoDbCong.Collection = this.cosmosDbConfig.Collection;
                    this.mongoDbCong.RUs = this.cosmosDbConfig.RUs;
                    this.mongoDbCong.Api = MongoDbApi.Sql;
                    var storage = this.factory.Resolve<IMongoDbSql>().Initialize(this.mongoDbCong);
                    await storage.CreateDatabaseAndCollectionsIfNotExistAsync();
                    return;
                  
                }
                else if (this.storageType == AsaOutputStorageType.TimeSeriesInsights)
                {
                    this.log.Info("Skip creating output storage because the storage type is Time Series Insights", () => { });
                    return;
                }
                //if (this.storageType == AsaOutputStorageType.MongoDbSql)
                //{
                //    this.mongoDbCong.Collection = this.cosmosDbConfig.Collection;
                //    this.mongoDbCong.ConnectionString = this.cosmosDbConfig.ConnectionString;
                //    this.mongoDbCong.Database = this.cosmosDbConfig.Database;
                //    this.mongoDbCong.Collection = this.cosmosDbConfig.Collection;
                //    var storage = this.factory.Resolve<IMongoDbSql>().Initialize(this.mongoDbCong);
                //    await storage.CreateDatabaseAndCollectionsIfNotExistAsync();
                //    return;
                //}
            }
            catch (Exception e)
            {
                this.log.Error("Error while creating the output storage", () => new { e });
                throw new ExternalDependencyException("Error while creating the output storage", e);
            }

            throw new NotImplementedException();
        }
    }
}
