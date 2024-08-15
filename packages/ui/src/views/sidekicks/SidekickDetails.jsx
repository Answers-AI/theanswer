import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Typography, Paper, Box, Avatar, Divider, useTheme, Button, TextField } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { StyledButton } from '@/ui-component/button/StyledButton'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import useConfirm from '@/hooks/useConfirm'
import useNotifier from '@/utils/useNotifier'
import { enqueueSnackbar as enqueueSnackbarAction, closeSnackbar as closeSnackbarAction } from '@/store/actions'
import chatmessageApi from '@/api/chatmessage'
import { getLocalStorageChatflow, removeLocalStorageChatHistory } from '@/utils/genericHelper'
import { IconEraser, IconX } from '@tabler/icons-react'
import ConfirmDialog from '@/ui-component/dialog/ConfirmDialog'
import useApi from '@/hooks/useApi'
import chatflowsApi from '@/api/chatflows'
import { ChatMessage } from '../chatmessage/ChatMessage'
import Sidebar from '@/ui-component/extended/Sidebar'

const SidekickDetails = ({ isCreating = false }) => {
    const theme = useTheme()
    const { id } = useParams()
    const dispatch = useDispatch()
    const { confirm } = useConfirm()
    const customization = useSelector((state) => state.customization)

    const [sidekickDetails, setSidekickDetails] = useState(null)
    const [selectedChatflow, setSelectedChatflow] = useLocalStorage(`lastSelectedChatflow_${id}`, '')
    const [isChatOpen, setIsChatOpen] = useState(false)
    const chatContainerRef = useRef(null)
    const [previews, setPreviews] = useState([])
    const [overrideConfig, setOverrideConfig] = useState({})
    const [chatKey, setChatKey] = useState(0)

    const getChatflowApi = useApi(chatflowsApi.getSpecificChatflow)

    useNotifier()
    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    const scrollToBottom = useCallback(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
    }, [])

    const clearChat = async () => {
        try {
            const confirmPayload = {
                title: `Clear Chat History`,
                description: `Are you sure you want to clear all chat history?`,
                confirmButtonName: 'Clear',
                cancelButtonName: 'Cancel'
            }
            const isConfirmed = await confirm(confirmPayload)

            if (isConfirmed) {
                if (!selectedChatflow) {
                    enqueueSnackbar({
                        message: 'No chatflow selected',
                        options: {
                            key: new Date().getTime() + Math.random(),
                            variant: 'warning',
                            action: (key) => (
                                <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                                    <IconX />
                                </Button>
                            )
                        }
                    })
                    return
                }
                const objChatDetails = getLocalStorageChatflow(selectedChatflow)
                if (!objChatDetails.chatId) {
                    return
                }
                await chatmessageApi.deleteChatmessage(selectedChatflow, { chatId: objChatDetails.chatId, chatType: 'INTERNAL' })
                removeLocalStorageChatHistory(selectedChatflow)
                setChatKey((prevKey) => prevKey + 1)
                setPreviews([])
                enqueueSnackbar({
                    message: 'Successfully cleared all chat history',
                    options: {
                        key: new Date().getTime() + Math.random(),
                        variant: 'success',
                        action: (key) => (
                            <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                                <IconX />
                            </Button>
                        )
                    }
                })
            }
        } catch (error) {
            console.error('Error in clearChat:', error)
            enqueueSnackbar({
                message: error.message || 'An error occurred while clearing chat history',
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'error',
                    persist: true,
                    action: (key) => (
                        <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                            <IconX />
                        </Button>
                    )
                }
            })
        }
    }

    useEffect(() => {
        if (id && !isCreating) {
            getChatflowApi.request(id)
        }
    }, [id, isCreating])

    useEffect(() => {
        if (getChatflowApi.data) {
            setSidekickDetails(getChatflowApi.data)
            setSelectedChatflow(getChatflowApi.data.id)
            setIsChatOpen(true)
        }
    }, [getChatflowApi.data])

    useEffect(() => {
        if (selectedChatflow) {
            setIsChatOpen(true)
        }
    }, [selectedChatflow])

    useEffect(() => {
        scrollToBottom()
    }, [scrollToBottom, selectedChatflow, isChatOpen])

    if (!isCreating && !sidekickDetails) {
        return <Typography>Loading...</Typography>
    }

    const handleOverrideConfigChange = (newConfig) => {
        setOverrideConfig((prev) => ({ ...prev, ...newConfig }))
    }

    // Function to format JSON string
    const formatJSON = (jsonString) => {
        try {
            return JSON.stringify(JSON.parse(jsonString), null, 2)
        } catch (error) {
            return jsonString // Return original string if parsing fails
        }
    }

    // Function to get sidekick data without flowData
    const getSidekickDataWithoutFlow = () => {
        if (!sidekickDetails) return ''
        const { flowData, ...restData } = sidekickDetails
        return JSON.stringify(restData, null, 2)
    }

    return (
        <Box sx={{ flexGrow: 1, p: 3, height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar src={sidekickDetails?.profilePic} alt={sidekickDetails?.name} sx={{ width: 100, height: 100, mr: 3 }} />
                    <Box>
                        <Typography variant='h4' gutterBottom>
                            {sidekickDetails?.name}
                        </Typography>
                        <Typography variant='body1' gutterBottom>
                            {sidekickDetails?.description}
                        </Typography>
                    </Box>
                </Box>
                {customization.isDarkMode ? (
                    <StyledButton
                        variant='outlined'
                        color='error'
                        title='Clear Conversation'
                        onClick={clearChat}
                        startIcon={<IconEraser />}
                    >
                        Clear Chat
                    </StyledButton>
                ) : (
                    <Button variant='outlined' color='error' title='Clear Conversation' onClick={clearChat} startIcon={<IconEraser />}>
                        Clear Chat
                    </Button>
                )}
            </Box>
            <Divider sx={{ borderColor: theme.palette.primary.main, borderWidth: 2, my: 2 }} />
            <Box sx={{ display: 'flex', flexGrow: 1, height: 'calc(100% - 100px)' }}>
                <Box sx={{ width: '66.67%', pr: 2 }}>
                    <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {selectedChatflow && (
                            <Box ref={chatContainerRef} sx={{ flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                                <ChatMessage
                                    key={`${selectedChatflow}-${chatKey}`}
                                    open={isChatOpen}
                                    chatflowid={selectedChatflow}
                                    isAgentCanvas={false}
                                    isDialog={false}
                                    previews={previews}
                                    setPreviews={setPreviews}
                                    overrideConfig={overrideConfig}
                                />
                            </Box>
                        )}
                    </Paper>
                </Box>
                <Box sx={{ width: '33.33%', pl: 2 }}>
                    <Paper elevation={3} sx={{ height: '100%', p: 2, overflow: 'auto' }}>
                        <Sidebar
                            chatflows={[sidekickDetails]}
                            selectedChatflow={selectedChatflow}
                            setSelectedChatflow={setSelectedChatflow}
                            setOverrideConfig={handleOverrideConfigChange}
                            isSidekickPage={true}
                        />
                    </Paper>
                </Box>
                <Divider sx={{ my: 3 }} />
                <Box>
                    <Typography variant='h6' gutterBottom>
                        Sidekick Data (excluding flowData brad)
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={10}
                        variant='outlined'
                        InputProps={{
                            readOnly: true
                        }}
                        value={getSidekickDataWithoutFlow()}
                        sx={{ mb: 3 }}
                    />

                    <Typography variant='h6' gutterBottom>
                        Sidekick flowData
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={10}
                        variant='outlined'
                        InputProps={{
                            readOnly: true
                        }}
                        value={formatJSON(sidekickDetails?.flowData || '')}
                    />
                </Box>
            </Box>
            <ConfirmDialog />
        </Box>
    )
}

SidekickDetails.propTypes = {
    isCreating: PropTypes.bool
}

export default SidekickDetails
