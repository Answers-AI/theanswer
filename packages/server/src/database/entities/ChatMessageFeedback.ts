/* eslint-disable */
import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, Index, Unique, DeleteDateColumn } from 'typeorm'
import { IChatMessageFeedback, ChatMessageRatingType } from '../../Interface'

@Entity()
@Unique(['messageId'])
export class ChatMessageFeedback implements IChatMessageFeedback {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Index()
    @Column({ type: 'uuid' })
    chatflowid: string

    @Index()
    @Column({ type: 'varchar' })
    chatId: string

    @Column({ type: 'uuid' })
    messageId: string

    @Column({ nullable: true })
    rating: ChatMessageRatingType

    @Column({ nullable: true, type: 'text' })
    content?: string

    @Column({ type: 'timestamp' })
    @CreateDateColumn()
    createdDate: Date

    @Index()
    @Column({ type: 'uuid', nullable: true })
    userId?: string

    @Index()
    @Column({ type: 'uuid', nullable: true })
    organizationId?: string

    @DeleteDateColumn()
    deletedDate: Date
}
