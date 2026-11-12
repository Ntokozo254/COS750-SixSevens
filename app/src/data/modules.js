
import {
  Hash,
  Network,
  Search,
  Workflow,
  Target,
  Layers
} from "lucide-react";

export const modules = [
  {
    id: 1,
    title: "Introduction to Hashing",
    objective: "Understand why hash tables provide efficient data retrieval.",
    description: "Explore hash tables and how they organise information.",
    icon: Hash,
    duration: "10 min"
  },
  {
    id: 2,
    title: "Hash Functions",
    objective: "Calculate the home slot using key mod table size.",
    description: "Learn how a hash function maps keys to table positions.",
    icon: Target,
    duration: "12 min"
  },
  {
    id: 3,
    title: "Understanding Collisions",
    objective: "Identify when two keys map to the same table position.",
    description: "Discover why collisions occur and how to recognise them.",
    icon: Network,
    duration: "10 min"
  },
  {
    id: 4,
    title: "Linear Probing",
    objective: "Insert keys using linear probing, including wrap-around.",
    description: "Resolve collisions by checking the next available slot.",
    icon: Workflow,
    duration: "15 min"
  },
  {
    id: 5,
    title: "Searching in Hash Tables",
    objective: "Trace a search and determine when an unsuccessful search stops.",
    description: "Follow the probing sequence when searching for a key.",
    icon: Search,
    duration: "12 min"
  },
  {
    id: 6,
    title: "Clustering and Load Factor",
    objective: "Analyse how clustering and load factor affect performance.",
    description: "Understand how table occupancy influences efficiency.",
    icon: Layers,
    duration: "12 min"
  }
];
