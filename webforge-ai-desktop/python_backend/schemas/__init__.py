"""
__init__.py
───────────
schemas パッケージの初期化ファイル。
すべてのスキーマモデルを一元的にインポートして公開。
"""

# ─────────────────────────────────────────────────────────────────
# font_schema.py
# ─────────────────────────────────────────────────────────────────

from .font_schema import (
    # Metrics
    FontMetricsInput,
    FontMetricsResponse,
    # Contour & Glyph
    ContourPointInput,
    ContourInput,
    GlyphMetricsInput,
    GlyphDataInput,
    GlyphDataResponse,
    # Metadata
    FontMetadataInput,
    FontMetadataResponse,
    # Generate Request
    FontGenerateRequest,
    # Font Response
    FontResponse,
    FontListResponse,
    # Font Operations (Phase 2+)
    FontSubsetRequest,
    FontConvertRequest,
    FontVariableAdjustRequest,
    FontSubsetResponse,
    FontConvertResponse,
    # Preview
    FontPreviewRequest,
    FontPreviewResponse,
    # Export
    FontExportRequest,
    FontExportResponse,
    # Stroke (Phase 2+)
    StrokeSettingsInput,
    StrokeSettingsResponse,
    FontWithStrokeRequest,
    # History & Cache
    FontGenerationHistoryEntry,
    FontGenerationHistoryListResponse,
    FontCacheInfo,
)


# ─────────────────────────────────────────────────────────────────
# project_schema.py
# ─────────────────────────────────────────────────────────────────

from .project_schema import (
    ProjectCreateRequest,
    ProjectUpdateRequest,
    ProjectResponse,
    ProjectListResponse,
    ProjectDetailResponse,
    ProjectSettingsResponse,
    ProjectSettingsUpdateRequest,
    ProjectStatistics,
    ProjectDeleteRequest,
    ProjectDeleteResponse,
)


# ─────────────────────────────────────────────────────────────────
# export_schema.py
# ─────────────────────────────────────────────────────────────────

from .export_schema import (
    ExportFormat,
    ExportPackageFormat,
    FontExportOptions,
    HTMLExportOptions,
    ZipExportOptions,
    ExportRequest,
    FontExportRequest as ExportFontRequest,
    ProjectExportRequest,
    ExportResponse,
    BulkExportResponse,
    ExportStatusResponse,
    ExportStatusListResponse,
    ExportHistoryEntry,
    ExportHistoryResponse,
    DownloadRequest,
    DownloadResponse,
    ExportSettingsResponse,
    ExportSettingsUpdateRequest,
    ExportStatistics,
    ProjectExportStatistics,
)


# ─────────────────────────────────────────────────────────────────
# llm_schema.py
# ─────────────────────────────────────────────────────────────────

from .llm_schema import (
    ChatRole,
    ChatMessage,
    ChatHistoryEntry,
    ChatRequest,
    ChatStreamRequest,
    ChatResponse,
    ChatStreamResponse,
    StrokeAdjustmentInstruction,
    MetricsAdjustmentInstruction,
    DesignInstruction,
    DesignInstructionParsedResponse,
    PromptContext,
    PromptBuilderRequest,
    PromptBuilderResponse,
    SessionCreateRequest,
    SessionResponse,
    SessionListResponse,
    SessionDeleteRequest,
    LLMProviderConfig,
    LLMProvidersResponse,
    ChatStatistics,
    ProjectChatStatistics,
)


# ─────────────────────────────────────────────────────────────────
# common_schema.py
# ─────────────────────────────────────────────────────────────────

from .common_schema import (
    ErrorResponse,
    ValidationErrorDetail,
    ValidationErrorResponse,
    PaginationRequest,
    PaginationMeta,
    PaginatedResponse,
    StatusResponse,
    HealthCheckResponse,
    VersionResponse,
    SearchFilter,
    SearchRequest,
    ResourceMetadata,
    BatchRequest,
    BatchOperationResult,
    BatchResponse,
    FileUploadResponse,
    AsyncOperationRequest,
    AsyncOperationStatus,
    AsyncOperationResponse,
    WebhookEvent,
    WebhookSubscriptionRequest,
    WebhookSubscriptionResponse,
    AuditLogEntry,
    AuditLogListResponse,
)


# ─────────────────────────────────────────────────────────────────
# __all__ - 公開API
# ─────────────────────────────────────────────────────────────────

__all__ = [
    # font_schema
    "FontMetricsInput",
    "FontMetricsResponse",
    "ContourPointInput",
    "ContourInput",
    "GlyphMetricsInput",
    "GlyphDataInput",
    "GlyphDataResponse",
    "FontMetadataInput",
    "FontMetadataResponse",
    "FontGenerateRequest",
    "FontResponse",
    "FontListResponse",
    "FontSubsetRequest",
    "FontConvertRequest",
    "FontVariableAdjustRequest",
    "FontSubsetResponse",
    "FontConvertResponse",
    "FontPreviewRequest",
    "FontPreviewResponse",
    "FontExportRequest",
    "FontExportResponse",
    "StrokeSettingsInput",
    "StrokeSettingsResponse",
    "FontWithStrokeRequest",
    "FontGenerationHistoryEntry",
    "FontGenerationHistoryListResponse",
    "FontCacheInfo",
    # project_schema
    "ProjectCreateRequest",
    "ProjectUpdateRequest",
    "ProjectResponse",
    "ProjectListResponse",
    "ProjectDetailResponse",
    "ProjectSettingsResponse",
    "ProjectSettingsUpdateRequest",
    "ProjectStatistics",
    "ProjectDeleteRequest",
    "ProjectDeleteResponse",
    # export_schema
    "ExportFormat",
    "ExportPackageFormat",
    "FontExportOptions",
    "HTMLExportOptions",
    "ZipExportOptions",
    "ExportRequest",
    "ExportFontRequest",
    "ProjectExportRequest",
    "ExportResponse",
    "BulkExportResponse",
    "ExportStatusResponse",
    "ExportStatusListResponse",
    "ExportHistoryEntry",
    "ExportHistoryResponse",
    "DownloadRequest",
    "DownloadResponse",
    "ExportSettingsResponse",
    "ExportSettingsUpdateRequest",
    "ExportStatistics",
    "ProjectExportStatistics",
    # llm_schema
    "ChatRole",
    "ChatMessage",
    "ChatHistoryEntry",
    "ChatRequest",
    "ChatStreamRequest",
    "ChatResponse",
    "ChatStreamResponse",
    "StrokeAdjustmentInstruction",
    "MetricsAdjustmentInstruction",
    "DesignInstruction",
    "DesignInstructionParsedResponse",
    "PromptContext",
    "PromptBuilderRequest",
    "PromptBuilderResponse",
    "SessionCreateRequest",
    "SessionResponse",
    "SessionListResponse",
    "SessionDeleteRequest",
    "LLMProviderConfig",
    "LLMProvidersResponse",
    "ChatStatistics",
    "ProjectChatStatistics",
    # common_schema
    "ErrorResponse",
    "ValidationErrorDetail",
    "ValidationErrorResponse",
    "PaginationRequest",
    "PaginationMeta",
    "PaginatedResponse",
    "StatusResponse",
    "HealthCheckResponse",
    "VersionResponse",
    "SearchFilter",
    "SearchRequest",
    "ResourceMetadata",
    "BatchRequest",
    "BatchOperationResult",
    "BatchResponse",
    "FileUploadResponse",
    "AsyncOperationRequest",
    "AsyncOperationStatus",
    "AsyncOperationResponse",
    "WebhookEvent",
    "WebhookSubscriptionRequest",
    "WebhookSubscriptionResponse",
    "AuditLogEntry",
    "AuditLogListResponse",
]
