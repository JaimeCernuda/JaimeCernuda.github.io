const e=`---
title: "A deep dive into our latest CVPR paper on zero-shot learning"
summary: "We proposed a novel framework for visual semantic embedding that outperforms current state-of-the-art models on generalized zero-shot learning tasks. Here is a breakdown of the math and the intuition behind the architecture."
date: "Sept 28, 2023"
category: "Research"
readTime: "12 min read"
popular: true
tags: ["CVPR", "Computer Vision", "Zero-Shot"]
---

# A deep dive into our latest CVPR paper on zero-shot learning

We proposed a novel framework for visual semantic embedding that outperforms current state-of-the-art models on generalized zero-shot learning tasks. Here is a breakdown of the math and the intuition behind the architecture.

## The Core Problem

Zero-shot learning (ZSL) aims to recognize objects from unseen classes by leveraging semantic information. The challenge is the **domain shift** problem: the model overfits to seen classes.

## Our Approach

We introduced a **Dual-Alignment Mechanism** that aligns visual features with semantic attributes in a shared latent space.

### Key Components

1.  **Visual Encoder**: A ResNet-101 backbone pre-trained on ImageNet.
2.  **Semantic Encoder**: A Transformer-based module that processes class attributes.
3.  **Cross-Modal Attention**: To fuse the modalities effectively.

\`\`\`python
def forward(self, x, attributes):
    visual_features = self.visual_encoder(x)
    semantic_features = self.semantic_encoder(attributes)
    return self.cross_modal_attention(visual_features, semantic_features)
\`\`\`

## Results

Our method achieved a **5% improvement** in harmonic mean on the CUB dataset compared to the previous SOTA.
`;export{e as default};
