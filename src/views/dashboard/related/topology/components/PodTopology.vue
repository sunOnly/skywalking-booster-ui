<!-- Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements.  See the NOTICE file distributed with
this work for additional information regarding copyright ownership.
The ASF licenses this file to You under the Apache License, Version 2.0
(the "License"); you may not use this file except in compliance with
the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. -->
<template>
  <div class="tool">
    <span
      v-show="
        dashboardStore.entity === EntityType[2].value &&
        dashboardStore.selectedGrid.showDepth
      "
    >
      <span class="label">{{ t("currentDepth") }}</span>
      <Selector
        class="inputs"
        :value="depth"
        :options="DepthList"
        placeholder="Select a option"
        @change="changeDepth"
      />
    </span>
    <span class="switch-icon ml-5" title="Settings" @click="setConfig">
      <Icon size="middle" iconName="settings" />
    </span>
    <span
      class="switch-icon ml-5"
      title="Back to overview topology"
      @click="backToTopology"
    >
      <Icon size="middle" iconName="keyboard_backspace" />
    </span>
    <div class="settings" v-show="showSettings">
      <Settings @update="updateConfig" />
    </div>
  </div>
  <div
    class="sankey"
    :style="`height:${height}px;width:${width}px;`"
    v-loading="loading"
    @click="handleClick"
  >
    <Sankey @click="selectNodeLink" />
  </div>
  <div
    class="operations-list"
    v-if="topologyStore.node"
    :style="{
      top: operationsPos.y + 'px',
      left: operationsPos.x + 'px',
    }"
  >
    <i v-for="(item, index) of items" :key="index" @click="item.func">
      <span
        v-if="
          ['alarm', 'inspect'].includes(item.id) ||
          (item.id === 'dashboard' && settings.nodeDashboard)
        "
      >
        {{ item.title }}
      </span>
    </i>
  </div>
</template>
<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { ref, onMounted, reactive } from "vue";
import { Option } from "@/types/app";
import { useTopologyStore } from "@/store/modules/topology";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useSelectorStore } from "@/store/modules/selectors";
import { EntityType, DepthList } from "../../../data";
import { ElMessage } from "element-plus";
import Sankey from "./Sankey.vue";
import Settings from "./Settings.vue";
import router from "@/router";

const { t } = useI18n();
const dashboardStore = useDashboardStore();
const selectorStore = useSelectorStore();
const topologyStore = useTopologyStore();
const loading = ref<boolean>(false);
const height = ref<number>(document.body.clientHeight - 150);
const width = ref<number>(document.body.clientWidth - 40);
const showSettings = ref<boolean>(false);
const settings = ref<any>({});
const operationsPos = reactive<{ x: number; y: number }>({ x: NaN, y: NaN });
const depth = ref<string>(dashboardStore.selectedGrid.depth || "3");
const items = [
  { id: "inspect", title: "Inspect", func: inspect },
  { id: "dashboard", title: "View Dashboard", func: goDashboard },
  { id: "alarm", title: "View Alarm", func: goAlarm },
];

onMounted(async () => {
  loadTopology(selectorStore.currentPod && selectorStore.currentPod.id);
});

async function loadTopology(id: string) {
  loading.value = true;
  const resp = await getTopology(id);
  loading.value = false;
  if (resp && resp.errors) {
    ElMessage.error(resp.errors);
  }
}

function inspect() {
  const id = topologyStore.node.id;
  topologyStore.setNode(null);
  topologyStore.setLink(null);
  loadTopology(id);
}

function goAlarm() {
  const path = `/alarm`;
  const routeUrl = router.resolve({ path });

  window.open(routeUrl.href, "_blank");
  topologyStore.setNode(null);
}
function goDashboard() {
  const entity =
    dashboardStore.entity === EntityType[2].value
      ? EntityType[2].value
      : EntityType[3].value;
  const path = `/dashboard/${dashboardStore.layerId}/${entity}/${topologyStore.node.serviceId}/${topologyStore.node.id}/${settings.value.nodeDashboard}`;
  const routeUrl = router.resolve({ path });
  window.open(routeUrl.href, "_blank");
  topologyStore.setNode(null);
}

function setConfig() {
  topologyStore.setNode(null);
  showSettings.value = !showSettings.value;
}

function updateConfig(config: any) {
  settings.value = config;
}

function backToTopology() {
  loadTopology(selectorStore.currentPod.id);
  topologyStore.setNode(null);
}

function selectNodeLink(d: any) {
  if (d.dataType === "edge") {
    topologyStore.setNode(null);
    topologyStore.setLink(d.data);
    if (!settings.value.linkDashboard) {
      return;
    }
    const { sourceObj, targetObj } = d.data;
    const entity =
      dashboardStore.entity === EntityType[2].value
        ? EntityType[6].value
        : EntityType[5].value;
    const path = `/dashboard/${dashboardStore.layerId}/${entity}/${sourceObj.serviceId}/${sourceObj.id}/${targetObj.serviceId}/${targetObj.id}/${settings.value.linkDashboard}`;
    const routeUrl = router.resolve({ path });
    window.open(routeUrl.href, "_blank");
    return;
  }
  topologyStore.setNode(d.data);
  topologyStore.setLink(null);
  operationsPos.x = d.event.event.clientX;
  operationsPos.y = d.event.event.clientY;
}

async function changeDepth(opt: Option[]) {
  depth.value = opt[0].value;
  loadTopology(selectorStore.currentPod.id);
}

async function getTopology(id: string) {
  let resp;
  switch (dashboardStore.entity) {
    case EntityType[2].value:
      resp = await topologyStore.updateEndpointTopology(
        [id],
        Number(depth.value)
      );
      break;
    case EntityType[4].value:
      resp = await topologyStore.getInstanceTopology();
      break;
  }
  return resp;
}
function handleClick(event: any) {
  if (event.target.nodeName === "svg") {
    topologyStore.setNode(null);
    topologyStore.setLink(null);
  }
}
</script>
<style lang="scss" scoped>
.sankey {
  margin-top: 10px;
  background-color: #333840;
  color: #ddd;
}

.settings {
  position: absolute;
  top: 40px;
  right: 0;
  width: 400px;
  height: 700px;
  background-color: #2b3037;
  overflow: auto;
  padding: 0 15px;
  border-radius: 3px;
  color: #ccc;
  transition: all 0.5ms linear;
  z-index: 99;
  text-align: left;
}

.tool {
  text-align: right;
  margin-top: 10px;
  position: relative;
}

.switch-icon {
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.5ms linear;
  background-color: #252a2f99;
  color: #ddd;
  display: inline-block;
  border-radius: 3px;
}

.label {
  color: #ccc;
  display: inline-block;
  margin-right: 5px;
}

.operations-list {
  position: absolute;
  padding: 10px;
  color: #333;
  cursor: pointer;
  background-color: #fff;
  border-radius: 3px;

  span {
    display: block;
    height: 30px;
    width: 140px;
    line-height: 30px;
    text-align: center;
  }

  span:hover {
    color: #409eff;
    background-color: #eee;
  }

  i {
    font-style: normal;
  }
}
</style>
