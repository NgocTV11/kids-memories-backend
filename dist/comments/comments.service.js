"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CommentsService = class CommentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, createCommentDto) {
        const { photo_id, content, parent_comment_id } = createCommentDto;
        const photo = await this.prisma.photos.findFirst({
            where: {
                id: photo_id,
                is_deleted: false,
                album: {
                    user: {
                        id: userId,
                    },
                    is_deleted: false,
                },
            },
        });
        if (!photo) {
            throw new common_1.NotFoundException('Photo not found or you do not have access');
        }
        if (parent_comment_id) {
            const parentComment = await this.prisma.comments.findFirst({
                where: {
                    id: parent_comment_id,
                    photo_id: photo_id,
                    is_deleted: false,
                },
            });
            if (!parentComment) {
                throw new common_1.NotFoundException('Parent comment not found or does not belong to this photo');
            }
        }
        const comment = await this.prisma.comments.create({
            data: {
                photo_id,
                user_id: userId,
                content,
                parent_comment_id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        display_name: true,
                        avatar_url: true,
                    },
                },
                _count: {
                    select: {
                        replies: true,
                    },
                },
            },
        });
        return {
            ...comment,
            replies_count: comment._count.replies,
            _count: undefined,
        };
    }
    async findByPhoto(userId, photoId) {
        const photo = await this.prisma.photos.findFirst({
            where: {
                id: photoId,
                is_deleted: false,
                album: {
                    user: {
                        id: userId,
                    },
                    is_deleted: false,
                },
            },
        });
        if (!photo) {
            throw new common_1.NotFoundException('Photo not found or you do not have access');
        }
        const topLevelComments = await this.prisma.comments.findMany({
            where: {
                photo_id: photoId,
                parent_comment_id: null,
                is_deleted: false,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        display_name: true,
                        avatar_url: true,
                    },
                },
                _count: {
                    select: {
                        replies: true,
                    },
                },
            },
            orderBy: {
                created_at: 'asc',
            },
        });
        const commentsWithReplies = await Promise.all(topLevelComments.map(async (comment) => {
            const replies = await this.getReplies(comment.id);
            return {
                ...comment,
                replies_count: comment._count.replies,
                replies,
                _count: undefined,
            };
        }));
        return commentsWithReplies;
    }
    async getReplies(commentId) {
        const replies = await this.prisma.comments.findMany({
            where: {
                parent_comment_id: commentId,
                is_deleted: false,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        display_name: true,
                        avatar_url: true,
                    },
                },
                _count: {
                    select: {
                        replies: true,
                    },
                },
            },
            orderBy: {
                created_at: 'asc',
            },
        });
        return Promise.all(replies.map(async (reply) => {
            const nestedReplies = await this.getReplies(reply.id);
            return {
                ...reply,
                replies_count: reply._count.replies,
                replies: nestedReplies,
                _count: undefined,
            };
        }));
    }
    async findOne(userId, commentId) {
        const comment = await this.prisma.comments.findFirst({
            where: {
                id: commentId,
                is_deleted: false,
                photo: {
                    is_deleted: false,
                    album: {
                        user: {
                            id: userId,
                        },
                        is_deleted: false,
                    },
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        display_name: true,
                        avatar_url: true,
                    },
                },
                photo: {
                    select: {
                        id: true,
                        caption: true,
                        thumbnail_url: true,
                    },
                },
                _count: {
                    select: {
                        replies: true,
                    },
                },
            },
        });
        if (!comment) {
            throw new common_1.NotFoundException('Comment not found or you do not have access');
        }
        const replies = await this.getReplies(comment.id);
        return {
            ...comment,
            replies_count: comment._count.replies,
            replies,
            _count: undefined,
        };
    }
    async update(userId, commentId, updateCommentDto) {
        const comment = await this.prisma.comments.findFirst({
            where: {
                id: commentId,
                user_id: userId,
                is_deleted: false,
            },
        });
        if (!comment) {
            throw new common_1.ForbiddenException('You can only edit your own comments');
        }
        const updated = await this.prisma.comments.update({
            where: { id: commentId },
            data: {
                content: updateCommentDto.content,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        display_name: true,
                        avatar_url: true,
                    },
                },
                _count: {
                    select: {
                        replies: true,
                    },
                },
            },
        });
        return {
            ...updated,
            replies_count: updated._count.replies,
            _count: undefined,
        };
    }
    async remove(userId, commentId) {
        const comment = await this.prisma.comments.findFirst({
            where: {
                id: commentId,
                user_id: userId,
                is_deleted: false,
            },
        });
        if (!comment) {
            throw new common_1.ForbiddenException('You can only delete your own comments');
        }
        await this.prisma.comments.update({
            where: { id: commentId },
            data: {
                is_deleted: true,
            },
        });
        return {
            message: 'Comment deleted successfully',
        };
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommentsService);
//# sourceMappingURL=comments.service.js.map