import { Chart } from './Chart'
import { withStyles } from 'material-ui/styles'

const styles = {
  empty: {
    width: 48,
    height: 48,
    color: '#757575'
  }
}

export default withStyles(styles)(Chart)
