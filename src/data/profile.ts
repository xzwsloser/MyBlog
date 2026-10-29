export interface FocusArea {
  label: string
  description: Record<'en' | 'zh', string>
}

export const profile = {
  name: {
    en: 'ZhiWei Xiao',
    zh: '肖志威'
  },
  school: {
    en: 'Huazhong University of Science & Technology',
    zh: '华中科技大学'
  },
  intro: {
    en: 'Hello, I am ZhiWei Xiao from Huazhong University of Science & Technology. I am interested in LLMs, multimodal AI, embodied intelligence, and AI infrastructure.',
    zh: '你好，我是来自华中科技大学的肖志威。我对大语言模型、多模态智能、具身智能和 AI 基础设施方向很感兴趣。'
  },
  learning: {
    en: 'I am currently learning these technology stacks and building a deeper foundation step by step.',
    zh: '我正在努力学习这些技术栈，并一步步打下更扎实的基础。'
  },
  focus: [
    {
      label: 'LLM',
      description: {
        en: 'Large Language Models',
        zh: '大语言模型'
      }
    },
    {
      label: 'Multimodal',
      description: {
        en: 'Multimodal AI',
        zh: '多模态智能'
      }
    },
    {
      label: 'Embodied AI',
      description: {
        en: 'Embodied Intelligence',
        zh: '具身智能'
      }
    },
    {
      label: 'AI Infra',
      description: {
        en: 'AI Infrastructure',
        zh: 'AI 基础设施'
      }
    }
  ] satisfies FocusArea[]
}
