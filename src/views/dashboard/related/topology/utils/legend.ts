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
import icons from "@/assets/img/icons";

export default function topoLegend(
  graph: any,
  clientHeight: number,
  clientWidth: number,
  config: any
) {
  for (const item of ["CUBE", "CUBEERROR"]) {
    graph
      .append("image")
      .attr("width", 30)
      .attr("height", 30)
      .attr("x", clientWidth - (item === "CUBEERROR" ? 340 : 440))
      .attr("y", clientHeight - 50)
      .attr("xlink:href", () =>
        item === "CUBEERROR" ? icons.CUBEERROR : icons.CUBE
      );
    graph
      .append("text")
      .attr("x", clientWidth - (item === "CUBEERROR" ? 310 : 410))
      .attr("y", clientHeight - 30)
      .text(() => {
        const l = config || [];
        const str = l
          .map((d: any) => `${d.name} ${d.condition} ${d.value}`)
          .join(" and ");
        return item === "CUBEERROR"
          ? config
            ? `Unhealthy (${str})`
            : "Unhealthy"
          : "Healthy";
      })
      .style("fill", "#efeff1")
      .style("font-size", "11px");
  }
}
