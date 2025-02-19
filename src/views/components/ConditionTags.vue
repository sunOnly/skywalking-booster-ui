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
  <div class="flex-h" :class="{ light: theme === 'light' }">
    <div class="mr-5">
      <span class="sm grey" v-show="theme === 'dark'">{{ t("tags") }}: </span>
      <span
        class="trace-tags"
        :style="type === 'LOG' ? `min-width: 122px;` : ''"
      >
        <span class="selected" v-for="(item, index) in tagsList" :key="index">
          <span>{{ item }}</span>
          <span class="remove-icon" @click="removeTags(index)">×</span>
        </span>
      </span>
      <el-input
        v-model="tags"
        class="trace-new-tag"
        @change="addLabels"
        :placeholder="t('addTags')"
      />
      <span class="tags-tip">
        <a
          target="blank"
          href="https://github.com/apache/skywalking/blob/master/docs/en/setup/backend/configuration-vocabulary.md"
        >
          {{ t("tagsLink") }}
        </a>
        <el-tooltip :content="t('traceTagsTip')">
          <span>
            <Icon class="icon-help mr-5" iconName="help" size="middle" />
          </span>
        </el-tooltip>
        <b v-if="type !== 'LOG'">{{ t("noticeTag") }}</b>
      </span>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";

/*global defineEmits, defineProps */
const emit = defineEmits(["update"]);
defineProps({
  type: { type: String, default: "TRACE" },
});
const { t } = useI18n();
const theme = ref<string>("dark");
const tags = ref<string>("");
const tagsList = ref<string[]>([]);

function removeTags(index: number) {
  tagsList.value.splice(index, 1);
  updateTags();
  localStorage.setItem("traceTags", JSON.stringify(this.tagsList));
}
function addLabels() {
  if (!tags.value) {
    return;
  }
  tagsList.value.push(tags.value);
  tags.value = "";
  updateTags();
}
function updateTags() {
  const tagsMap = tagsList.value.map((item: string) => {
    const key = item.substring(0, item.indexOf("="));
    return {
      key,
      value: item.substring(item.indexOf("=") + 1, item.length),
    };
  });
  emit("update", { tagsMap, tagsList: tagsList.value });
}
</script>
<style lang="scss" scoped>
.trace-tags {
  padding: 1px 5px 0 0;
  border-radius: 3px;
  height: 24px;
  display: inline-block;
  vertical-align: top;
}

.selected {
  display: inline-block;
  padding: 0 3px;
  border-radius: 3px;
  overflow: hidden;
  border: 1px dashed #aaa;
  font-size: 12px;
  margin: 3px 2px 0 2px;
}

.trace-new-tag {
  border-style: unset;
  outline: 0;
  padding: 2px 5px;
  border-radius: 3px;
  width: 250px;
  margin-right: 3px;
}

.remove-icon {
  display: inline-block;
  margin-left: 3px;
  cursor: pointer;
}

.tags-tip {
  color: #a7aebb;
}

.light {
  color: #3d444f;

  input {
    border: 1px solid #ccc;
  }

  .selected {
    color: #3d444f;
  }
}

.icon-help {
  cursor: pointer;
}
</style>
