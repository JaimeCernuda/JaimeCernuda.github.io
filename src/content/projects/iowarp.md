---
title: "IOWarp"
description: "Advanced data management platform for AI-augmented scientific workflows with $5M NSF funding"
year: 2024
category: "Data Management"
featured: true
status: "On-going"
tags:
  - AI/ML
  - Data Management
  - HPC
links:
  website: "https://iowarp.ai"
  code: "https://github.com/iowarp"
image: "/images/projects/iowarp.png"
---

# IOWarp: Advanced Data Management Platform for AI-Augmented Scientific Workflows

**IOWarp** is a $5 million NSF-funded platform (Award #2411318, 2024-2029) that provides proven infrastructure for intelligent I/O orchestration in scientific computing. IOWarp is a comprehensive data management platform designed to address the unique challenges in scientific workflows that integrate simulation, analytics, and Artificial Intelligence (AI).

## Project Goals

- Enhancing data exchange and transformation across scientific workflows
- Reducing data access latency with advanced storage systems
- Developing an open-source, community-driven framework

## Architecture

### Content Assimilation Engine (CAE)
Transforms diverse format-specific data into IOWarp's unified data representation format, optimized for data transfer.

### Content Transfer Engine (CTE)
Manages efficient data flow across workflow stages with:
- Multi-tiered I/O support
- GPU Direct I/O
- Secure Transfer Protocols

### Content Exploration Interface (CEI)
Enables advanced data querying with **WarpGPT**, a language model-driven interface for complex scientific queries.

## Towards Agentic-Driven Scientific Workflows

IOWarp pioneered the integration of AI agents into scientific computing following Anthropic's Model Context Protocol (MCP) release. Our agents can:

- **Understand Scientific Data** - Parse HDF5, Adios BP5, NetCDF formats
- **Orchestrate Workflows** - Submit jobs, manage resources
- **Generate Insights** - Data analysis and visualization
- **Ensure Reproducibility** - Full provenance tracking

## Scientific MCPs

Available at [github.com/iowarp/iowarp-mcps](https://github.com/iowarp/iowarp-mcps):
- **Adios MCP** - Analyze Adios BP5 files
- **HDF5 MCP** - Explore HDF5 datasets
- **Jarvis MCP** - Automated deployment
- **Slurm MCP** - Job scheduling

## Collaborators

- HDF Group
- University of Utah
- Argonne National Laboratory
- Lawrence Livermore National Laboratory
- NERSC

## Sponsor

National Science Foundation - Award #2411318 (2024-2029) - **$5 Million**
