import PropTypes from 'prop-types'
import { Box, Grid, Skeleton, Typography } from '@mui/material'

const FlowListView = ({ data, images = {}, nodeTypes = {}, isLoading, updateFlowsApi, setError, type, onItemClick, renderItem }) => {
    const finalData = data?.filter(Boolean) || []

    const handleItemClick = (item) => {
        if (typeof onItemClick === 'function') {
            onItemClick(item)
        }
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Grid container spacing={3}>
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Skeleton variant='rectangular' height={200} />
                        </Grid>
                    ))
                ) : finalData.length > 0 ? (
                    finalData.map((item) => (
                        <Grid item xs={12} sm={6} md={4} key={item.id || item.templateId}>
                            {renderItem({
                                item,
                                images: images && images[item.id],
                                nodeTypes: nodeTypes && nodeTypes[item.id],
                                onClick: () => handleItemClick(item),
                                type,
                                updateFlowsApi,
                                setError
                            })}
                        </Grid>
                    ))
                ) : (
                    <Grid item xs={12}>
                        <Typography variant='body1' align='center'>
                            No items found.
                        </Typography>
                    </Grid>
                )}
            </Grid>
        </Box>
    )
}

FlowListView.propTypes = {
    data: PropTypes.array,
    images: PropTypes.object,
    nodeTypes: PropTypes.object,
    isLoading: PropTypes.bool,
    updateFlowsApi: PropTypes.object,
    setError: PropTypes.func,
    type: PropTypes.oneOf(['chatflows', 'agentflows', 'marketplace', 'tools', 'journeys']).isRequired,
    onItemClick: PropTypes.func.isRequired,
    renderItem: PropTypes.func.isRequired
}

export default FlowListView
