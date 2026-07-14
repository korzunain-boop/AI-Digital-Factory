/**
 * Opaque string identifiers used across domain objects.
 * No UUID library dependency — callers may generate IDs however they choose.
 */

/** Unique id for a ResearchBrief. */
export type ResearchBriefId = string;

/** Unique id for a GenerationRequest. */
export type GenerationRequestId = string;

/** Unique id for an AssetBundle. */
export type AssetBundleId = string;

/** Unique id for a ProductPackage. */
export type ProductPackageId = string;

/** Unique id for a QAReport. */
export type QAReportId = string;

/** Unique id for a PublishPackage. */
export type PublishPackageId = string;

/** Unique id for a Job. */
export type JobId = string;

/** Opaque storage location (URI or path string). Infrastructure interprets this. */
export type StorageLocation = string;

/** Product-agnostic key selecting a GeneratorStrategy implementation. */
export type StrategyKey = string;
