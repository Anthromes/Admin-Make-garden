import React from 'react'
import PropTypes from 'prop-types'
import { HiddenInput, Button } from './Styled'
import { ReactComponent as UploadIcon } from '../../assets/upload__new.svg'

const UploadButton = ({ onUpload, grey = false }) => (
  <Button grey={grey}>
    <UploadIcon />
    <HiddenInput onChange={ev => onUpload(ev.target.files)} />
  </Button>
)

UploadButton.propTypes = {
  onUpload: PropTypes.func.isRequired,
  grey: PropTypes.bool,
}

export default UploadButton
