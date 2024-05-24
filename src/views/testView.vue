<script>
import { VNetworkGraph } from "v-network-graph"

export default {
  components: {
    VNetworkGraph,
  },
  data() {
    return {
      nodes: {
        node1: { name: "Node 1" },
        node2: { name: "Node 2" },
        node3: { name: "Node 3" },
        node4: { name: "Node 4" },
      },
      edges: {
        edge1: { source: "node1", target: "node2", label: "test1" },
        edge2: { source: "node2", target: "node3", label: "test2" },
        edge3: { source: "node3", target: "node4", label: "test3" },
      },
    }
  }
}
</script>

<template>
  <VNetworkGraph :nodes="nodes" :edges="edges">
    <template #edge-label="{ edge, ...slotProps }">
      <VEdgeLabel :text="edge.label" align="center" vertical-align="above" v-bind="slotProps" />
    </template>
  </VNetworkGraph>
</template>