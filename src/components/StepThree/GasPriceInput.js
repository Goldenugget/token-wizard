import React, { Component } from 'react'
import { GAS_PRICE } from '../../utils/constants'
import { objectKeysToLowerCase } from '../../utils/utils'
import { Errors } from '../Common/Errors'
import { inject, observer } from 'mobx-react'
import { FormControlTitle } from '../Common/FormControlTitle'
import { TextField } from '../Common/TextField'

@inject('generalStore')
@observer
class GasPriceInput extends Component {
  constructor(props) {
    super(props)

    this.setWrapperRef = this.setWrapperRef.bind(this)
    this.handleClickOutside = this.handleClickOutside.bind(this)
  }

  state = {
    customGasPrice: undefined,
    gasTypeSelected: {},
    isCustom: false,
    openDropdown: false,
    selectText: ''
  }

  async componentDidMount() {
    const { generalStore } = this.props
    const gasTypeSelected = objectKeysToLowerCase(generalStore.getGasTypeSelected)

    this.setState({ gasTypeSelected: gasTypeSelected })

    if (gasTypeSelected.id === GAS_PRICE.CUSTOM.ID) {
      this.setState({
        customGasPrice: gasTypeSelected.price,
        isCustom: true
      })
    }

    document.addEventListener('mousedown', this.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside)
  }

  setWrapperRef(node) {
    this.wrapperRef = node
  }

  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.closeDropdown()
    }
  }

  openDropdown() {
    this.setState({
      openDropdown: true
    })
  }

  closeDropdown() {
    this.setState({
      openDropdown: false
    })
  }

  handleNonCustomSelected = value => {
    const { input } = this.props

    this.setState({
      isCustom: false
    })

    const gasTypeSelected = objectKeysToLowerCase(value)

    this.handleGasType(gasTypeSelected)

    input.onChange(gasTypeSelected)

    this.closeDropdown()
  }

  handleCustomSelected = value => {
    const { input } = this.props

    this.setState({
      isCustom: true
    })

    let gasTypeSelected = objectKeysToLowerCase(GAS_PRICE.CUSTOM)

    if (this.state.customGasPrice) {
      gasTypeSelected.price = this.state.customGasPrice
    }

    this.handleGasType(gasTypeSelected)

    input.onChange(
      Object.assign(
        {},
        {
          id: gasTypeSelected.id,
          price: gasTypeSelected.price
        }
      )
    )

    this.closeDropdown()
  }

  handleGasType = value => {
    const { updateGasTypeSelected } = this.props

    updateGasTypeSelected(value)

    this.setState({
      gasTypeSelected: value
    })
  }

  handleCustomGasPriceChange = value => {
    const { updateGasTypeSelected, input } = this.props
    let gasTypeSelected = this.state.gasTypeSelected

    gasTypeSelected.price = value

    updateGasTypeSelected(gasTypeSelected)
    this.setState({
      gasTypeSelected: gasTypeSelected,
      customGasPrice: value
    })

    input.onChange(
      Object.assign(
        {},
        {
          id: gasTypeSelected.id,
          price: value
        }
      )
    )
  }

  compareChecked = value => {
    // eslint-disable-next-line
    return new String(this.state.gasTypeSelected.id).valueOf() === new String(value).valueOf()
  }

  render() {
    let selectText = ''
    const { input, gasPrices, extraClassName } = this.props
    const selectItems = gasPrices.map((gasPrice, index) => {
      if (this.compareChecked(gasPrice.id)) selectText = gasPrice.description

      return (
        <label
          key={index}
          className="sw-GasPriceInput_SelectItem"
          onClick={e => {
            gasPrice.id !== GAS_PRICE.CUSTOM.ID
              ? this.handleNonCustomSelected(gasPrice)
              : this.handleCustomSelected(gasPrice.id)
          }}
        >
          <input
            checked={this.compareChecked(gasPrice.id)}
            className="sw-GasPriceInput_SelectInput"
            id={gasPrice.id}
            name="gas-price"
            type="radio"
            value={gasPrice.id}
          />
          <span className="sw-GasPriceInput_SelectText">{gasPrice.description}</span>
        </label>
      )
    })

    return (
      <div
        className={`sw-GasPriceInput ${extraClassName ? extraClassName : ''} ${
          this.state.openDropdown ? 'sw-GasPriceInput-open' : ''
        }`}
      >
        <FormControlTitle title="Gas Price" description="Slow is cheap, fast is expensive." />
        <div className="sw-GasPriceInput_Select" ref={this.setWrapperRef}>
          <button
            type="button"
            className={`sw-GasPriceInput_SelectButton`}
            onClick={e => {
              this.openDropdown()
            }}
          >
            <span className="sw-GasPriceInput_SelectButtonText">{selectText ? selectText : 'Select'}</span>
            <span className="sw-GasPriceInput_SelectButtonChevron" />
          </button>
          <div
            className="sw-GasPriceInput_SelectList"
            onClick={e => {
              e.stopPropagation()
            }}
          >
            {selectItems}
          </div>
        </div>
        {this.state.isCustom ? (
          <TextField
            id="customGasPrice"
            min={GAS_PRICE.CUSTOM.PRICE}
            step="any"
            name="gas-price-custom-value"
            onChange={e => this.handleCustomGasPriceChange(e.target.value)}
            placeholder="Enter here"
            type="number"
            value={this.state.customGasPrice}
          />
        ) : null}
        <Errors name={input.name} />
      </div>
    )
  }
}

export default GasPriceInput
