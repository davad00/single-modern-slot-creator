/**
 * Public surface of the slot client core.
 *
 * Everything exported here is pure, deterministic TypeScript with zero
 * DOM/PixiJS dependency. The presentation layer (PixiJS v8) builds on top of
 * these seams — see README.md § Architecture.
 */

// money — integer minor units, canonical floor rule
export {
  assertMinor,
  assertPositiveInt,
  winMinor,
  maxWinCapMinor,
  minorExponent,
  formatMinor,
  type FormatMinorOptions,
} from './core/money.js';

// domain types
export {
  TIER_IDS,
  SPIN_MODES,
  STEP_TYPES,
  MOST_RESTRICTIVE_POLICY,
  SYMBOL_ID_PATTERN,
  ROUND_ID_PATTERN,
  STEP_ID_PATTERN,
  type TierId,
  type SpinMode,
  type StepType,
  type GridPosition,
  type Win,
  type Step,
  type FeatureBlock,
  type OutcomeManifest,
  type SymbolKind,
  type SymbolConfig,
  type PaytableEntry,
  type ReelContext,
  type ReelSetConfig,
  type ScatterTierConfig,
  type CascadeConfig,
  type GameConfig,
  type JurisdictionPolicy,
} from './core/types.js';

// dev/test RNG (never for real-money outcomes)
export { Xoshiro128StarStar, splitmix32, type RngState } from './core/rng.js';

// state machine
export {
  GAME_STATES,
  TRANSITIONS,
  SlotStateMachine,
  InvalidTransitionError,
  isAuthoritative,
  isPresentation,
  type GameState,
  type TransitionInfo,
  type MachineEventMap,
  type MachineEventName,
  type MachineMode,
  type StateMachineOptions,
} from './core/stateMachine.js';

// round provider contract + shared manifest validation
export {
  validateManifest,
  assertValidManifest,
  stepsWinTotalMinor,
  ManifestValidationError,
  type RoundProvider,
  type RequestRoundOptions,
  type ResumeResult,
  type ManifestIssue,
} from './core/roundProvider.js';

// dev round provider (DEV/TEST ONLY)
export { DevRoundProvider, type DevRequestRoundOptions } from './core/devRoundProvider.js';

// wire-format serialization (schemas/outcome-manifest.schema.json)
export {
  toWireManifest,
  wireMetaFromConfig,
  DEV_PLACEHOLDER_CONFIG_HASH,
  type WireOutcomeManifest,
  type WireFeature,
  type WireStep,
  type WireWin,
  type WireManifestMeta,
} from './core/wireManifest.js';

// production RGS adapter interface
export {
  NotImplementedRgsAdapter,
  NotImplementedError,
  type RgsAdapter,
  type RgsSessionInfo,
  type RgsConnectOptions,
  type RoundHistoryQuery,
  type RoundHistoryEntry,
  type SignatureVerifier,
} from './core/rgsAdapter.js';

// recovery
export { buildRecoveryPlan, stateForStep, presentationStatePath, type RecoveryPlan } from './core/recovery.js';

// autoplay
export {
  AutoplayController,
  type AutoplayConfig,
  type AutoplayState,
  type AutoplayRoundResult,
  type AutoplayStopReason,
} from './core/autoplay.js';

// input guard
export {
  InputGuard,
  type InputGuardOptions,
  type InputContext,
  type InputAction,
  type RawInputKind,
} from './core/inputGuard.js';

// spin timing (presentation schedules — pure)
export {
  SPIN_MODE_PROFILES,
  resolveSpinMode,
  anticipationReels,
  buildSpinSchedule,
  scheduleToTimelineEvents,
  type SpinModeProfile,
  type ReelSchedule,
  type StepSchedule,
  type SpinSchedule,
} from './core/spinTiming.js';

// deterministic timeline engine
export {
  Timeline,
  DuplicateEventError,
  type TimelineEventInput,
  type TimelineFiring,
  type TimelineMarker,
  type SkipTarget,
  type FiringListener,
} from './core/timeline.js';

// config loading
export {
  validateGameConfig,
  validateJurisdictionPolicy,
  parseGameConfig,
  parseJurisdictionPolicy,
  loadConfigBundle,
  ConfigError,
  type ConfigIssue,
  type ConfigBundle,
} from './core/configLoader.js';
