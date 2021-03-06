// Copyright (c) Microsoft. All rights reserved.

import Config from 'app.config';
import { HttpClient } from 'utilities/httpClient';
import {
  prepareLogoResponse,
  toDeviceGroupModel,
  toDeviceGroupsModel,
  toSolutionSettingActionsModel,
  toSolutionSettingThemeModel,

  toPackagesModel,
  toPackageModel,
  toConfigTypesModel
} from './models';
import { Observable } from '../../node_modules/rxjs';

const ENDPOINT = Config.serviceUrls.config;

/** Contains methods for calling the config service */
export class ConfigService {

  /** Returns a the account's device groups */
  static getDeviceGroups() {
    var option = {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng',
        'Content-Type': 'application/json;charset=utf-8',
        'Access-Control-Allow-Origin' : '*'
      }
    }
    return HttpClient.get(`${ENDPOINT}devicegroups`,option)
      .map(toDeviceGroupsModel);
  }

  /** Creates a new device group */
  static createDeviceGroup(payload) {
    var options = {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng',
        'Content-Type': 'application/json;charset=utf-8',
        'Access-Control-Allow-Origin' : '*'
      }
    }
    return HttpClient.post(`${ENDPOINT}devicegroups`, payload,options)
      .map(toDeviceGroupModel);
  }

  static updateDeviceGroup(id, payload) {
    return HttpClient.put(`${ENDPOINT}devicegroups/${id}`, payload)
      .map(toDeviceGroupModel);
  }

  /** Delete a device group */
  static deleteDeviceGroup(id) {
    return HttpClient.delete(`${ENDPOINT}devicegroups/${id}`)
      .map(_ => id);
  }

  static getLogo() {
    var options = {};
    options.responseType = 'blob';
    options.headers = {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng',
        'Content-Type': 'application/json;charset=utf-8',
        'Access-Control-Allow-Origin' : '*'
    }
    return HttpClient.get(`${ENDPOINT}solution-settings/logo`, options)
      .map(prepareLogoResponse);
  }

  static setLogo(logo, header) {
    const options = {
      headers: header,
      responseType: 'blob'
    };

    if (!logo) {
      logo = '';
    }

    options.headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng';
    return HttpClient.put(`${ENDPOINT}solution-settings/logo`, logo, options)
      .map(prepareLogoResponse);
  }

  /* Get solution settings.
      The API name is "solution-settings/theme" even though it deals with diagnosticsOptIn,
      AzureMapsKeys, name, description and UI theme. */
  static getSolutionSettings() {
    return HttpClient.get(`${ENDPOINT}solution-settings/theme`)
      .map(toSolutionSettingThemeModel)
      /* When the application loads for the first time, there won't be "solution-settings"
       in the storage. In that case, service will throw a 404 not found error.
       But we need to ignore that and stick with the static values defined in UI state */
      .catch(error =>
        error.status === 404 ? Observable.empty() : Observable.throw(error)
      );
  }

  /* Update solution settings.
     The API name is "solution-settings/theme" even though it deals with diagnosticsOptIn,
      AzureMapsKeys, name, description and UI theme.*/
  static updateSolutionSettings(model) {
    return HttpClient.put(`${ENDPOINT}solution-settings/theme`, model)
      .map(toSolutionSettingThemeModel);
  }

  static getActionSettings() {
    return HttpClient.get(`${ENDPOINT}solution-settings/actions`)
      .map(toSolutionSettingActionsModel);
  }

  /** Creates a new package */
  static createPackage(packageModel) {
    var options = {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng',
        'Content-Type': 'application/json;charset=utf-8',
        'Access-Control-Allow-Origin' : '*'
      }
    }
   
    return HttpClient.post(`${ENDPOINT}packages`, packageModel, options)
      .map(toPackageModel);
  }

  /** Returns all the account's packages */
  static getPackages() {
    var option = {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng',
        'Content-Type': 'application/json;charset=utf-8',
        'Access-Control-Allow-Origin' : '*'
      }
    }
    return HttpClient.get(`${ENDPOINT}packages`,option)
      .map(toPackagesModel);
  }

  /** Returns filtered packages */
  static getFilteredPackages(packageType, configType) {
    return HttpClient.get(`${ENDPOINT}packages?packagetype=${packageType}&configtype=${configType}`)
      .map(toPackagesModel);
  }

  /** Returns all the account's packages */
  static getConfigTypes() {
    return HttpClient.get(`${ENDPOINT}configtypes`)
      .map(toConfigTypesModel);
  }

  /** Delete a package */
  static deletePackage(id) {
    return HttpClient.delete(`${ENDPOINT}packages/${id}`)
      .map(_ => id);
  }
}
