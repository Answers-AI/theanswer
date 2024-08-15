import PropTypes from 'prop-types'
import { Box, Typography, Avatar, Chip } from '@mui/material'
import { styled } from '@mui/material/styles'
import MainCard from '@/ui-component/cards/MainCard'

const CardWrapper = styled(MainCard)(({ theme }) => ({
    background: theme.palette.card.main,
    color: theme.darkTextPrimary,
    overflow: 'hidden',
    position: 'relative',
    cursor: 'pointer',
    '&:hover': {
        background: theme.palette.card.hover,
        boxShadow: '0 2px 14px 0 rgb(32 40 45 / 20%)'
    },
    height: '100%'
}))

const SidekickCard = ({ data, onClick }) => {
    return (
        <CardWrapper onClick={() => onClick(data)}>
            <Box sx={{ p: 2, display: 'flex' }}>
                <Avatar src={data.avatar} sx={{ width: 60, height: 60, mr: 2 }} />
                <Box>
                    <Typography variant='h3' component='div'>
                        {data.name}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                        {data.description}
                    </Typography>
                </Box>
            </Box>
            <Box sx={{ p: 2 }}>
                <Typography variant='subtitle2' component='div'>
                    Knowledge Bases:
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {data?.knowledgeBases?.map((kb, index) => (
                        <Chip key={index} label={kb} size='small' />
                    ))}
                </Box>
            </Box>
        </CardWrapper>
    )
}

SidekickCard.propTypes = {
    data: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        avatar: PropTypes.string,
        knowledgeBases: PropTypes.arrayOf(PropTypes.string)
    }).isRequired,
    onClick: PropTypes.func.isRequired
}

export default SidekickCard
