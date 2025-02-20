/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { defineStore } from "pinia";
import { Duration } from "@/types/app";
import { Service, Instance, Endpoint } from "@/types/selector";
import { store } from "@/store";
import graphql from "@/graphql";
import { AxiosResponse } from "axios";
import { useAppStoreWithOut } from "@/store/modules/app";

interface SelectorState {
  services: Service[];
  destServices: Service[];
  pods: Array<Instance | Endpoint>;
  currentService: Nullable<Service>;
  currentPod: Nullable<Instance | Endpoint>;
  currentDestService: Nullable<Service>;
  currentDestPod: Nullable<Instance | Endpoint>;
  destPods: Array<Instance | Endpoint>;
  durationTime: Duration;
}

export const selectorStore = defineStore({
  id: "selector",
  state: (): SelectorState => ({
    services: [],
    destServices: [],
    pods: [],
    destPods: [],
    currentService: null,
    currentPod: null,
    currentDestService: null,
    currentDestPod: null,
    durationTime: useAppStoreWithOut().durationTime,
  }),
  actions: {
    setCurrentService(service: Nullable<Service>) {
      this.currentService = service;
    },
    setCurrentDestService(service: Nullable<Service>) {
      this.currentDestService = service;
    },
    setCurrentPod(pod: Nullable<Instance | Endpoint>) {
      this.currentPod = pod;
    },
    setCurrentDestPod(pod: Nullable<Instance | Endpoint>) {
      this.currentDestPod = pod;
    },
    async fetchLayers(): Promise<AxiosResponse> {
      const res: AxiosResponse = await graphql.query("queryLayers").params({});

      return res.data || {};
    },
    async fetchServices(layer: string): Promise<AxiosResponse> {
      const res: AxiosResponse = await graphql
        .query("queryServices")
        .params({ layer });

      if (!res.data.errors) {
        this.services = res.data.data.services || [];
        this.destServices = res.data.data.services || [];
      }
      return res.data;
    },
    async getServiceInstances(param?: {
      serviceId: string;
      isRelation: boolean;
    }): Promise<Nullable<AxiosResponse>> {
      const serviceId = param ? param.serviceId : this.currentService?.id;
      if (!serviceId) {
        return null;
      }
      const res: AxiosResponse = await graphql.query("queryInstances").params({
        serviceId,
        duration: this.durationTime,
      });
      if (!res.data.errors) {
        if (param && param.isRelation) {
          this.destPods = res.data.data.pods || [];
          return res.data;
        }
        this.pods = res.data.data.pods || [];
      }
      return res.data;
    },
    async getEndpoints(params: {
      keyword?: string;
      serviceId?: string;
      isRelation?: boolean;
    }): Promise<Nullable<AxiosResponse>> {
      if (!params) {
        params = {};
      }
      const serviceId = params.serviceId || this.currentService?.id;
      if (!serviceId) {
        return null;
      }
      const res: AxiosResponse = await graphql.query("queryEndpoints").params({
        serviceId,
        duration: this.durationTime,
        keyword: params.keyword || "",
      });
      if (!res.data.errors) {
        if (params.isRelation) {
          this.destPods = res.data.data.pods || [];
          return res.data;
        }
        this.pods = res.data.data.pods || [];
      }
      return res.data;
    },
    async getService(serviceId: string, isRelation: boolean) {
      if (!serviceId) {
        return;
      }
      const res: AxiosResponse = await graphql.query("queryService").params({
        serviceId,
      });
      if (!res.data.errors) {
        if (isRelation) {
          this.setCurrentDestService(res.data.data.service);
          this.destServices = [res.data.data.service];
          return res.data;
        }
        this.setCurrentService(res.data.data.service);
        this.services = [res.data.data.service];
      }

      return res.data;
    },
    async getInstance(instanceId: string, isRelation?: boolean) {
      if (!instanceId) {
        return;
      }
      const res: AxiosResponse = await graphql.query("queryInstance").params({
        instanceId,
      });
      if (!res.data.errors) {
        if (isRelation) {
          this.currentDestPod = res.data.data.instance || null;
          this.destPods = [res.data.data.instance];
          return;
        }
        this.currentPod = res.data.data.instance || null;
        this.pods = [res.data.data.instance];
      }

      return res.data;
    },
    async getEndpoint(endpointId: string, isRelation?: string) {
      if (!endpointId) {
        return;
      }
      const res: AxiosResponse = await graphql.query("queryEndpoint").params({
        endpointId,
      });
      if (!res.data.errors) {
        if (isRelation) {
          this.currentDestPod = res.data.data.endpoint || null;
          this.destPods = [res.data.data.endpoint];
          return;
        }
        this.currentPod = res.data.data.endpoint || null;
        this.pods = [res.data.data.endpoint];
      }

      return res.data;
    },
  },
});

export function useSelectorStore(): any {
  return selectorStore(store);
}
