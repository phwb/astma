import React from 'react'
import PropTypes from 'prop-types'
import isEmpty from 'lodash/isEmpty'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import InsertChart from 'material-ui-icons/InsertChart'
import { CircularProgress } from 'material-ui/Progress'

export const Chart = (props) => {
  const {
    classes,
    data,
    loading
  } = props

  if (loading) {
    return <CircularProgress color="accent" size={50}/>
  }

  if (isEmpty(data)) {
    return <InsertChart className={classes.empty}/>
  }

  return (
    <ResponsiveContainer width="95%" height="95%">
      <LineChart data={data}>
        <XAxis dataKey="date"/>
        <YAxis/>
        <Tooltip/>
        <CartesianGrid strokeDasharray="3 3"/>
        <Line dataKey="value" type="monotone" stroke="#8884d8"/>
      </LineChart>
    </ResponsiveContainer>
  )
}

Chart.propTypes = {
  classes: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired
}
