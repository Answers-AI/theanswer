import { Request, Response, NextFunction } from 'express'
import { ChatMessageRatingType, chatType, IReactFlowObject } from '../../Interface'
import chatflowsService from '../../services/chatflows'
import chatMessagesService from '../../services/chat-messages'
import { clearSessionMemory } from '../../utils'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { FindOptionsWhere } from 'typeorm'
import { ChatMessage } from '../../database/entities/ChatMessage'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import { StatusCodes } from 'http-status-codes'

const createChatMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body) {
            throw new InternalFlowiseError(
                StatusCodes.PRECONDITION_FAILED,
                'Error: chatMessagesController.createChatMessage - request body not provided!'
            )
        }
        const apiResponse = await chatMessagesService.createChatMessage(req.body, req.user?.id)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const getAllChatMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let chatTypeFilter = req.query?.chatType as chatType | undefined
        if (chatTypeFilter) {
            try {
                const chatTypeFilterArray = JSON.parse(chatTypeFilter)
                if (chatTypeFilterArray.includes(chatType.EXTERNAL) && chatTypeFilterArray.includes(chatType.INTERNAL)) {
                    chatTypeFilter = undefined
                } else if (chatTypeFilterArray.includes(chatType.EXTERNAL)) {
                    chatTypeFilter = chatType.EXTERNAL
                } else if (chatTypeFilterArray.includes(chatType.INTERNAL)) {
                    chatTypeFilter = chatType.INTERNAL
                }
            } catch (e) {
                return res.status(500).send(e)
            }
        }
        const sortOrder = req.query?.order as string | undefined
        const chatflowId = (req.query?.chatflowId ?? req.query?.id ?? req.params.id) as string

        const chatId = req.query?.chatId as string | undefined
        const memoryType = req.query?.memoryType as string | undefined
        const sessionId = req.query?.sessionId as string | undefined
        const messageId = req.query?.messageId as string | undefined
        const startDate = req.query?.startDate as string | undefined
        const endDate = req.query?.endDate as string | undefined
        const feedback = req.query?.feedback as boolean | undefined

        let feedbackTypeFilters = req.query?.feedbackType as ChatMessageRatingType[] | undefined
        if (feedbackTypeFilters) {
            try {
                const feedbackTypeFilterArray = JSON.parse(JSON.stringify(feedbackTypeFilters))
                if (
                    feedbackTypeFilterArray.includes(ChatMessageRatingType.THUMBS_UP) &&
                    feedbackTypeFilterArray.includes(ChatMessageRatingType.THUMBS_DOWN)
                ) {
                    feedbackTypeFilters = [ChatMessageRatingType.THUMBS_UP, ChatMessageRatingType.THUMBS_DOWN]
                } else if (feedbackTypeFilterArray.includes(ChatMessageRatingType.THUMBS_UP)) {
                    feedbackTypeFilters = [ChatMessageRatingType.THUMBS_UP]
                } else if (feedbackTypeFilterArray.includes(ChatMessageRatingType.THUMBS_DOWN)) {
                    feedbackTypeFilters = [ChatMessageRatingType.THUMBS_DOWN]
                } else {
                    feedbackTypeFilters = undefined
                }
            } catch (e) {
                return res.status(500).send(e)
            }
        }
        if (!chatflowId && !chatId) {
            throw new InternalFlowiseError(
                StatusCodes.PRECONDITION_FAILED,
                `Error: chatMessageController.getAllChatMessages - id not provided!`
            )
        }
        const apiResponse = await chatMessagesService.getAllChatMessages(
            req.user!,
            chatflowId,
            chatTypeFilter,
            sortOrder,
            chatId,
            memoryType,
            sessionId,
            startDate,
            endDate,
            messageId,
            feedback,
            feedbackTypeFilters,
            req.user?.id
        )
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const getAllInternalChatMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sortOrder = req.query?.order as string | undefined
        const chatId = req.query?.chatId as string | undefined
        const memoryType = req.query?.memoryType as string | undefined
        const sessionId = req.query?.sessionId as string | undefined
        const userId = req.query?.userId as string | undefined
        const messageId = req.query?.messageId as string | undefined
        const startDate = req.query?.startDate as string | undefined
        const endDate = req.query?.endDate as string | undefined
        const feedback = req.query?.feedback as boolean | undefined
        const apiResponse = await chatMessagesService.getAllInternalChatMessages(
            req.user!,
            req.params.id,
            chatType.INTERNAL,
            sortOrder,
            chatId,
            memoryType,
            sessionId,
            startDate,
            endDate,
            messageId,
            feedback,
            undefined,
            userId
        )
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

//Delete all chatmessages from chatId
const removeAllChatMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const appServer = getRunningExpressApp()
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new InternalFlowiseError(
                StatusCodes.PRECONDITION_FAILED,
                'Error: chatMessagesController.removeAllChatMessages - id not provided!'
            )
        }
        const chatflowid = req.params.id
        const chatflow = await chatflowsService.getChatflowById(req.params.id, req.user!)
        if (!chatflow) {
            return res.status(404).send(`Chatflow ${req.params.id} not found`)
        }
        const chatId = req.query?.chatId as string
        const memoryType = req.query?.memoryType as string | undefined
        const sessionId = req.query?.sessionId as string | undefined
        const chatType = req.query?.chatType as string | undefined
        const isClearFromViewMessageDialog = req.query?.isClearFromViewMessageDialog as string | undefined
        const flowData = chatflow.flowData
        const parsedFlowData: IReactFlowObject = JSON.parse(flowData)
        const nodes = parsedFlowData.nodes
        try {
            await clearSessionMemory(
                nodes,
                appServer.nodesPool.componentNodes,
                chatId,
                appServer.AppDataSource,
                sessionId,
                memoryType,
                isClearFromViewMessageDialog
            )
        } catch (e) {
            return res.status(500).send('Error clearing chat messages')
        }

        const deleteOptions: FindOptionsWhere<ChatMessage> = { chatflowid }
        if (chatId) deleteOptions.chatId = chatId
        if (memoryType) deleteOptions.memoryType = memoryType
        if (sessionId) deleteOptions.sessionId = sessionId
        if (chatType) deleteOptions.chatType = chatType
        const apiResponse = await chatMessagesService.removeAllChatMessages(chatId, chatflowid, deleteOptions, req.user?.id)
        return res.json(apiResponse)
    } catch (error) {
        next(error)
    }
}

const abortChatMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.chatflowid || !req.params.chatid) {
            throw new InternalFlowiseError(
                StatusCodes.PRECONDITION_FAILED,
                `Error: chatMessagesController.abortChatMessage - chatflowid or chatid not provided!`
            )
        }
        await chatMessagesService.abortChatMessage(req.params.chatid, req.params.chatflowid)
        return res.json({ status: 200, message: 'Chat message aborted' })
    } catch (error) {
        next(error)
    }
}

export default {
    createChatMessage,
    getAllChatMessages,
    getAllInternalChatMessages,
    removeAllChatMessages,
    abortChatMessage
}
