---
title: "Coeus"
description: "A context-aware active storage framework for accelerating large-scale scientific data analysis"
year: 2024
category: "Active Storage"
featured: false
status: "On-going"
tags:
  - Active Storage
  - Data Analysis
  - Scientific Computing
links:
  website: "https://grc.iit.edu/research/projects/coeus"
  code: "https://github.com/grc-iit/coeus-adapter"
image: "/images/projects/coeus.png"
---

# Coeus: Accelerating Scientific Insights Using Enriched Metadata

Coeus is a context-aware active storage framework designed to accelerate large-scale scientific data analysis by computing derived quantities in-transit during data production. Implemented as an Adios2 plugin engine and integrated with the Hermes hierarchical buffering platform, Coeus reduces I/O bottlenecks, minimizes unnecessary data movement, and improves time-to-insight for scientific workflows.

In collaboration with Sandia and Oak Ridge National Laboratories, Coeus investigates the use of an active storage system to calculate derived quantities and support complex queries on scientific data.

## Project Goals

- **Active in-transit derivation** of scientific quantities to avoid repetitive post-processing I/O
- **Intelligent hierarchical storage** for both raw and derived data
- **Context-aware data placement** informed by high-level I/O patterns
- **Flexible, SQL-enabled querying** over enriched metadata

## Technical Architecture

### Semantic Derived Quantity Language
Supports arithmetic operations, aggregation, filtering, statistics, integrals, derivatives, and mathematical macros.

### Metadata Management
- **Operational Metadata** - Variable information (type, dimensions, offsets)
- **Enriched Metadata** - User-generated annotations (threshold tags, bounding boxes, statistics)

### Hierarchical Storage Optimization
- Blob Scoring Algorithm for intelligent data placement
- Context-Aware Prefetching
- Dynamic Reorganization

## Collaborators

- Sandia National Laboratories
- Oak Ridge National Laboratory

## Sponsor

U.S. Department of Energy (DOE)
