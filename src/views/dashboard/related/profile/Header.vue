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
  <div class="flex-h header">
    <!-- <div class="mr-10" v-if="dashboardStore.entity==='All'">
      <span class="grey mr-5">{{ t("service") }}:</span>
      <Selector
        size="small"
        :value="service.value"
        :options="profileStore.services"
        placeholder="Select a service"
        @change="changeService"
      />
    </div> -->
    <div class="mr-10">
      <span class="grey mr-5">{{ t("endpointName") }}:</span>
      <el-input v-model="endpointName" class="name" />
    </div>
    <el-button
      class="search-btn"
      size="small"
      type="primary"
      @click="searchTasks"
    >
      {{ t("search") }}
    </el-button>
    <el-button class="search-btn" size="small" @click="createTask">
      {{ t("newTask") }}
    </el-button>
  </div>
  <el-dialog
    v-model="newTask"
    :destroy-on-close="true"
    fullscreen
    @closed="newTask = false"
  >
    <NewTask @close="newTask = false" />
  </el-dialog>
</template>
<script lang="ts" setup>
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useProfileStore } from "@/store/modules/profile";
import { useSelectorStore } from "@/store/modules/selectors";
import { ElMessage } from "element-plus";
import NewTask from "./components/NewTask.vue";

const profileStore = useProfileStore();
const selectorStore = useSelectorStore();
const { t } = useI18n();
// const service = ref<any>({});
const endpointName = ref<string>("");
const newTask = ref<boolean>(false);

searchTasks();
// getServices();

// async function getServices() {
//   const res = await profileStore.getServices(dashboardStore.layerId);

//   if (res.errors) {
//     ElMessage.error(res.errors);
//     return;
//   }
//   service.value = profileStore.services[0];
//   searchTasks();
// }

// function changeService(opt: any[]) {
//   service.value = opt[0];
// }
async function searchTasks() {
  profileStore.setConditions({
    serviceId: selectorStore.currentService.id,
    endpointName: endpointName.value,
  });
  const res = await profileStore.getTaskList();

  if (res.errors) {
    ElMessage.error(res.errors);
  }
}

function createTask() {
  newTask.value = true;
}

watch(
  () => selectorStore.currentService,
  () => {
    searchTasks();
  }
);
</script>
<style lang="scss" scoped>
.header {
  padding: 10px;
  font-size: 12px;
  border-bottom: 1px solid #dcdfe6;
}

.name {
  width: 270px;
}
</style>
