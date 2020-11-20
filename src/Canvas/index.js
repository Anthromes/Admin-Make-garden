import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { fetchData as fetchProjects } from '../Projects/actions'
import * as actions from './actions'
import { Wrapper, Area, InnerArea, Link, PreviewLink } from './Styled'
import Zoom from '../newComponents/NewZoom'
import ActionsBar from '../newComponents/ActionsBarNew'
import Dialogue from '../newComponents/DialogueNew'
import ProjectHeader from '../newComponents/ProjectPickerNew'
import Constants from '../constants'
import DropzoneArea from '../newComponents/DropzoneArea'
import ResizableImage from './ResizableImage'
import Pins from '../Pins'
import CanvasImage from './CanvasImage'
import UploadArea from '../UploadArea'

const { MAX_ZOOM_LEVEL, EDIT_MODES } = Constants

class Canvas extends React.PureComponent {
  static propTypes = {
    activeCanvas: PropTypes.object,
    updateSection: PropTypes.func,
    fetchCanvasData: PropTypes.func,
    isCanvasGridView: PropTypes.bool,
    changeCanvasMode: PropTypes.func,
    editMode: PropTypes.string,
    pins: PropTypes.array,
    user: PropTypes.object,
  }

  constructor(props) {
    super(props)
    const canvasId = props.match.params.canvasId
    props.fetchCanvasData(canvasId)
    props.fetchProjects()
    this.state = {
      selectedSection: null,
      zoomLevel: 0,
      canvasId,
      activeImageIndex: 0,
      activeImageIndexes: {},
    }
  }

  componentDidUpdate = prevProps => {
    if (this.props.match.params.canvasId !== prevProps.match.params.canvasId) {
      const canvasId = this.props.match.params.canvasId
      this.props.fetchCanvasData(canvasId)
      // this.props.fetchProjects()
      this.setState({
        selectedSection: null,
        zoomLevel: 0,
        canvasId,
        activeImageIndex: 0,
      })
    }
  }

  onSectionSelect = selectedSection => {
    const { activeImageIndexes } = this.state
    // check for not set up index
    const activeImageIndex =
      activeImageIndexes[selectedSection.id] === undefined
        ? 0 //selectedSection.imageIds.length - 1
        : activeImageIndexes[selectedSection.id]
    this.setState({
      selectedSection: this.props.activeCanvas.sections.find(s => s.id === selectedSection.id),
      activeImageIndexes: { ...activeImageIndexes, [selectedSection.id]: activeImageIndex },
      activeImageIndex: activeImageIndex,
    })
  }

  onChangeCanvasMode = mode => {
    this.setState({ selectedSection: null })
    this.props.changeCanvasMode(mode)
  }

  onAddPin = pin => {
    this.props.addPin(pin, this.state.canvasId)
  }

  onZoomChange = zoomLevel => {
    this.setState({ zoomLevel })
  }

  onChangeActiveImageIndex = index => {
    const { selectedSection, activeImageIndexes } = this.state
    this.setState({
      activeImageIndexes: { ...activeImageIndexes, [selectedSection.id]: +index },
    })
  }

  deleteImage = (id, section_id) => {
    this.setState({
      activeImageIndexes: {},
      activeImageIndex: 0,
    })
    this.props.deleteImage(id, section_id)
  }

  render() {
    const {
      activeCanvas,
      updateSection,
      isCanvasGridView,
      editMode,
      changeCanvasGridMode,
      pins,
      projects,
      editPin,
      deletePin,
      uploadImageToPin,
      addSection,
      uploadImages,
      activeImageIndex,
      deleteSection,
    } = this.props

    if (!activeCanvas) {
      return 'Loading canvas data...'
    }
    const { selectedSection, zoomLevel, canvasId, projectId } = this.state

    const sectionName = selectedSection ? selectedSection.title || selectedSection.name : 'No section selected'
    const { sections } = activeCanvas
    const selectedItemId = selectedSection ? selectedSection.id : null

    // NO ITEMS UPLOADED, SO SHOW THIS
    if (!sections.length) {
      return (
        <Wrapper>
          <ProjectHeader projectId={canvasId} projects={projects} />
          <DropzoneArea projectId={activeCanvas.project_id} canvasId={canvasId} userId={this.props.user.id} />
        </Wrapper>
      )
    }
    // ITEMS UPLOADED SO SHOW THIS
    return (
      <Wrapper>
        {/* Name to be changed since it's now a header */}
        <ProjectHeader projectId={canvasId} projects={projects} />

        <Dialogue />

        <ActionsBar
          zoomLevel={zoomLevel}
          sectionName={sectionName}
          isCanvasGridView={isCanvasGridView}
          editMode={editMode}
          onChangeCanvasView={changeCanvasGridMode}
          onChangeCanvasMode={this.onChangeCanvasMode}
          onZoomChange={zoomLevel => this.setState({ zoomLevel })}
        />

        <Zoom
          onClickPlus={() => zoomLevel < MAX_ZOOM_LEVEL && this.onZoomChange(zoomLevel + 1)}
          onClickMinus={() => zoomLevel > -MAX_ZOOM_LEVEL && this.onZoomChange(zoomLevel - 1)}
          zoomLevel={zoomLevel}
        />

        {/*<DndArea
          zoomLevel={zoomLevel}
          sections={activeCanvas.sections}
          onUpdate={updateSection}
          editMode={editMode}
          onSelect={this.onSectionSelect}
          isCanvasGridView={isCanvasGridView}
          selectedItemId={selectedSection ? selectedSection.id : null}
          pins={pins}
          onAddPin={this.onAddPin}
          onDeletePin={deletePin}
          onEditPin={editPin}
          onUploadImageToPin={uploadImageToPin}
          project_id={canvasId}
          addSection={addSection}
          uploadImages={uploadImages}
          activeImageIndex={activeImageIndex}
          onChangeActiveImageIndex={this.onChangeActiveImageIndex}
          hidePreview={this.changeShowPreview}
          showPreview={this.state.showPreview}
          deleteSection={deleteSection}
          deleteImage={this.deleteImage}
        />*/}
        <Area isGrid={isCanvasGridView}>
          <InnerArea>
            {editMode === EDIT_MODES.default &&
              sections.map((item, i) => (
                <ResizableImage
                  key={i}
                  item={item}
                  onSelect={this.onSectionSelect}
                  selectedItemId={selectedItemId}
                  zoomLevel={zoomLevel}
                  onResize={updateSection}
                  onDrop={updateSection}
                />
              ))}
            {editMode === EDIT_MODES.annotation && (
              <Fragment>
                <Pins
                  pins={pins}
                  addPin={this.onAddPin}
                  editPin={editPin}
                  deletePin={deletePin}
                  uploadImage={uploadImageToPin}
                  zoomLevel={zoomLevel}
                  editMode={editMode}
                />
                {sections.map((item, i) => (
                  <CanvasImage
                    key={i}
                    item={item}
                    onSelect={this.onSectionSelect}
                    selectedItemId={selectedItemId}
                    zoomLevel={zoomLevel}
                  />
                ))}
              </Fragment>
            )}

            {editMode === EDIT_MODES.area && (
              <Fragment>
                <UploadArea addUpload={addSection} zoomLevel={zoomLevel} project_id={null} />
                {sections.map((item, i) => (
                  <CanvasImage
                    key={i}
                    item={item}
                    onSelect={this.onSectionSelect}
                    selectedItemId={selectedItemId}
                    zoomLevel={zoomLevel}
                  />
                ))}
              </Fragment>
            )}

            {editMode === EDIT_MODES.upload && (
              <Fragment>
                {sections.map((item, i) => (
                  <CanvasImage
                    key={i}
                    item={item}
                    onSelect={this.onSectionSelect}
                    selectedItemId={selectedItemId}
                    zoomLevel={zoomLevel}
                    showRibbon={item.id === selectedItemId}
                    uploadImages={uploadImages}
                    project_id={activeCanvas.project_id}
                    onChangeActiveImageIndex={this.onChangeActiveImageIndex}
                    deleteSection={deleteSection}
                    deleteImage={this.deleteImage}
                  />
                ))}
              </Fragment>
            )}
          </InnerArea>
          <PreviewLink>
            Your canvas is published here:
            <Link href={'//paint.garden/#/' + canvasId} target="_blank">
              paint.garden/{canvasId}
            </Link>
          </PreviewLink>
        </Area>
      </Wrapper>
    )
  }
}

export default connect(
  ({ activeCanvas, isCanvasGridView, editMode, pins, projects, user }) => ({
    activeCanvas,
    isCanvasGridView,
    editMode,
    pins,
    projects,
    user,
  }),
  dispatch => bindActionCreators({ ...actions, fetchProjects }, dispatch),
)(Canvas)
