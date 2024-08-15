import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Grid, Typography } from '@mui/material'
import MainCard from '@/ui-component/cards/MainCard'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import SidekickCard from '@/ui-component/cards/SidekickCard'

// API
import chatflowsApi from '@/api/chatflows'

// Hooks
import useApi from '@/hooks/useApi'

const Sidekicks = () => {
    const navigate = useNavigate()
    const [isLoading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [sidekicks, setSidekicks] = useState([])
    const [search, setSearch] = useState('')

    const getSidekicksApi = useApi(chatflowsApi.getAllSidekicks)

    useEffect(() => {
        getSidekicksApi.request()
    }, [])

    useEffect(() => {
        if (getSidekicksApi.error) {
            setError(getSidekicksApi.error)
        }
    }, [getSidekicksApi.error])

    useEffect(() => {
        setLoading(getSidekicksApi.loading)
    }, [getSidekicksApi.loading])

    useEffect(() => {
        if (getSidekicksApi.data) {
            setSidekicks(getSidekicksApi.data)
        }
    }, [getSidekicksApi.data])

    const handleSearchChange = (event) => {
        setSearch(event.target.value)
    }

    const filteredSidekicks = sidekicks.filter(
        (sidekick) =>
            sidekick.name.toLowerCase().includes(search.toLowerCase()) || sidekick.description.toLowerCase().includes(search.toLowerCase())
    )

    const goToSidekickDetails = (selectedSidekick) => {
        navigate(`/sidekicks/${selectedSidekick.id}`)
    }

    return (
        <MainCard>
            <ViewHeader onSearchChange={handleSearchChange} search={true} searchPlaceholder='What can I help you with?' title='Sidekicks' />
            <Grid container spacing={3}>
                {filteredSidekicks.map((sidekick) => (
                    <Grid item xs={12} sm={6} key={sidekick.id}>
                        <SidekickCard data={sidekick} onClick={() => goToSidekickDetails(sidekick)} />
                    </Grid>
                ))}
            </Grid>
            {isLoading && <Typography>Loading...</Typography>}
            {error && <Typography color='error'>{error}</Typography>}
        </MainCard>
    )
}

export default Sidekicks
