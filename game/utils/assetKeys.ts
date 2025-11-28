export const ASSET_KEYS = {
  // Player
  PLAYER_IDLE: "player_idle",
  PLAYER_WALK: "player_walk",
  PLAYER_ATTACK: "player_attack",
  PLAYER_SKILL: "player_skill",
  PLAYER_HURT: "player_hurt",

  // Bosses
  BOSS_GPT4O: "boss_gpt4o",
  BOSS_GEMINI2: "boss_gemini2",
  BOSS_GPT5: "boss_gpt5",
  BOSS_GEMINI3: "boss_gemini3",
  BOSS_FINAL: "boss_final",

  // Effects
  EFFECT_SLASH: "effect_slash",
  EFFECT_BEAM: "effect_beam",
  EFFECT_SHIELD: "effect_shield",
  EFFECT_EXPLOSION: "effect_explosion",
  EFFECT_HIT: "effect_hit",

  // UI
  UI_HEALTH_BAR: "ui_health_bar",
  UI_SKILL_ICON: "ui_skill_icon",
  UI_GAUGE: "ui_gauge",

  // Backgrounds
  BG_STAGE1: "bg_stage1",
  BG_STAGE2: "bg_stage2",
  BG_STAGE3: "bg_stage3",
  BG_STAGE4: "bg_stage4",
  BG_STAGE5: "bg_stage5",
  BG_MENU: "bg_menu",

  // Audio
  BGM_MENU: "bgm_menu",
  BGM_BATTLE: "bgm_battle",
  BGM_BOSS: "bgm_boss",
  SFX_HIT: "sfx_hit",
  SFX_SLASH: "sfx_slash",
  SFX_SKILL: "sfx_skill",
  SFX_VICTORY: "sfx_victory",
  SFX_DEFEAT: "sfx_defeat",
} as const;

export type AssetKey = (typeof ASSET_KEYS)[keyof typeof ASSET_KEYS];
