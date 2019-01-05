import axios from 'axios'
import { getCookie } from 'formula_one/src/utils'
import React from 'react'
import { render } from 'react-dom'
import { Grid, Icon, Message, Radio, Button, Dropdown, Form, Header, Image } from 'semantic-ui-react'
import { DateInput } from 'semantic-ui-calendar-react';
import { getTheme } from 'formula_one'
import './index.css'

class UploadButton extends React.Component {

    render() {
        return (<>
            <input
                styleName={this.props.styles.image}
                type='file'
                onChange={this.props.onChange}
                count={this.props.count}
                name={`picture${this.props.count}`}
                id={`uploadPhoto${this.props.count}`}
            />
            <label styleName={this.props.styles.label} htmlFor={`uploadPhoto${this.props.count}`}><Icon styleName={this.props.styles.icon} styleName='upload-btn' name='upload'></Icon></label>
        </>
        )
    }
}
let style = {
    image: 'image-upload-input',
    label: 'image-upload-label',
    icon: 'image-upload-label'
}

export default class SaleItemForm extends React.Component {
    constructor(props) {
        super(props)
        const { item } = this.props
        if (!item) {
            this.state = {
                endDate: '',
                name: '',
                category: {
                    name: '',
                    slug: ''
                },
                details: '',
                cost: '',
                warrantyDetail: '',
                isPhoneVisible: false,
                paymentModes: [],
                pictures: ['', '', ''],
                picturesUrl: ['', '', ''],
                nameError: false,
                costError: false,
                categoryError: false,
                formError: false,
            }
        }
        else {
            let categoryName = ''
            this.props.categories.map((category) => {
                if (item.category == category.slug) {
                    categoryName = category.name
                    return
                }
                category.subCategories.map((subCategory) => {
                    if (item.category == subCategory.slug) {
                        categoryName = subCategory.name
                        return
                    }
                })
            })
            this.state = {
                endDate: item.endDate,
                name: item.name,
                category: {
                    name: categoryName,
                    slug: item.category
                },
                cost: item.cost,
                details: item.details,
                warrantyDetail: item.warrantyDetail,
                isPhoneVisible: item.isPhoneVisible,
                paymentModes: item.paymentModes,
                nameError: false,
                costError: false,
                categoryError: false,
                formError: false,
            }
        }
    }
    toggle = () => this.setState({ isPhoneVisible: !this.state.isPhoneVisible })

    handleChangePhone = (event, { name }) => {
        if (this.state.hasOwnProperty(name)) {
            this.setState({ [name]: !this.state[name] });
        }
    }
    handleChange = (event, { name, value }) => {
        if (this.state.hasOwnProperty(name)) {
            this.setState({ [name]: value });
            if (name == 'cost') {
                this.setState({
                    costError: isNaN(value),
                    formError: isNaN(value)
                })
            }
            else if (name == 'name') {
                if (!isNaN(value) && value.length > 0) {
                    this.setState({
                        nameError: true,
                        formError: true
                    })
                }
                else {
                    this.setState({
                        nameError: false,
                        formError: false
                    })
                }
            }
        }
    }
    handleSelectPicture = (e) => {

        if (e.target.files && e.target.files.length > 0) {
            const newPictures = this.state.pictures.slice()
            const newPicturesUrl = this.state.picturesUrl.slice()
            let count = e.target.getAttribute('count')
            newPictures[count] = e.target.files[0]
            newPicturesUrl[count] = URL.createObjectURL(e.target.files[0])
            this.setState({ 
                pictures: newPictures,
                picturesUrl: newPicturesUrl
             })
        }
    };
    handlePaymentChange = (event, { value }) => {
        this.setState({ paymentModes: value });
    }
    handleSubmit = (e) => {
        const { name, pictures, category, paymentModes, endDate, details, cost, warrantyDetail, isPhoneVisible } = this.state
        const { item } = this.props
        if (category.slug === '') {
            this.setState({
                categoryError: true,
                formError: true
            })
            return
        }
        if (isNaN(cost) || cost.length < 1) {
            this.setState({
                costError: true,
                formError: true
            })
            return
        }
        if (name.length < 3 || !isNaN(name)) {
            this.setState({
                nameError: true,
                formError: true
            })
            return
        }
        let formData = new FormData()
        formData.append('end_date', endDate);
        formData.append('name', name);
        formData.append('category', category.slug);
        formData.append('details', details);
        formData.append('cost', cost);
        formData.append('warranty_detail', warrantyDetail);
        formData.append('is_phone_visible', isPhoneVisible);
        paymentModes.map((mode) => {
            formData.append('payment_modes', mode)
        })
        if (item) {
            this.props.updateSaleItem(formData, item.id)
            this.props.handleDimmer(e)
        }
        else {
            this.props.addSaleItem(formData, pictures)
            setTimeout(() => {
                this.props.history.replace('/buy_and_sell/')
            }, 500);
        }

    }
    handleCategoryChange = (e, { value, name, slug }) => {
        let result = false;
        const { costError, nameError } = this.state
        if (costError || nameError) {
            result = true
        }
        this.setState({
            category: {
                slug: slug,
                name: name
            },
            categoryError: false,
            formError: result
        })
    }
    componentDidMount() {
        this.props.getPayment()
        const { item, shareSubmit } = this.props
        if (item) {
            shareSubmit(this.handleSubmit.bind(this))
        }
    }
    dropdown = () => {
        const { categories } = this.props
        const item = []
        categories.map((category, index) => {
            item.push(
                <React.Fragment key={index}>
                    <Dropdown.Item styleName='category-item' onClick={this.handleCategoryChange} value={category.name} slug={category.slug} name={category.name} key={index}>{category.name}</Dropdown.Item>
                    {category.subCategories.map((subCategory, i) => {
                        return (
                            <Dropdown.Item styleName='sub-cat' value={subCategory.name} name={subCategory.name} slug={subCategory.slug} onClick={this.handleCategoryChange} key={i}>{subCategory.name}</Dropdown.Item>
                        )
                    })}
                </React.Fragment>
            )
        })
        return (item)
    }
    hadleImgClose = (e, key) => {
        let newPictures = this.state.pictures;
        let newPicturesUrl = this.state.picturesUrl;
        newPictures[key] = ''
        newPicturesUrl[key]= ''
        this.setState({
            pictures: newPictures,
            picturesUrl:newPicturesUrl
        })
    }
    render() {
        const { user, item } = this.props
        const { categoryError, picturesUrl, nameError, pictures, cost, formError, endDate, category, warrantyDetail, details, name, costError } = this.state
        const paymentModes = this.props.paymentModes.map((mode, index) => {
            return {
                key: mode.name,
                value: mode.name,
                text: mode.name
            }
        })
        return (
            <Grid.Column width={16}>
                <Grid padded stackable styleName={!item ? 'grid-cont' : ''}>
                    {!item ?
                        <Grid.Row  styleName='heading-row' centered>
                            <Grid.Column width={8}>
                                <Header dividing as={'h3'}>Sell an Item</Header>
                            </Grid.Column>
                        </Grid.Row>
                        : null}
                    <Grid.Row centered>
                        <Grid.Column width={`${!item ? 8 : 14}`}>
                            <Form error={formError} encType='multiple/form-data'>
                                <Form.Field styleName='field-form' required>
                                    <label>Item name</label>
                                    <Form.Input
                                        autoComplete='off'
                                        name='name'
                                        onChange={this.handleChange}
                                        value={name}
                                        required
                                        placeholder='item name'
                                    />
                                </Form.Field>
                                {nameError ?
                                    <Message
                                        error
                                        content={`Field is empty or invalid name`}
                                    />
                                    : null
                                }
                                <Form.Field styleName='field-form' required>
                                    <label>Category</label>
                                    <Dropdown
                                        scrolling
                                        fluid
                                        value={category.name}
                                        text={category.name}
                                        placeholder={'Select a category'}
                                        styleName='category-field'
                                    >
                                        <Dropdown.Menu>
                                            {this.dropdown()}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                    {categoryError ?
                                        <Message
                                            error
                                            content={`Category field can't be empty.`}
                                        />
                                        : null
                                    }
                                </Form.Field>
                                <Form.Field styleName='field-form'>
                                    <label>Accepted modes of payment</label>
                                    <Dropdown
                                        placeholder='Payment modes'
                                        fluid
                                        multiple
                                        value={this.state.paymentModes}
                                        selection
                                        onChange={this.handlePaymentChange}
                                        options={paymentModes} />
                                </Form.Field>
                                <Form.Field styleName='field-form' required>
                                    <label>Expires On</label>
                                    <DateInput
                                        closable
                                        popupPosition="right center"
                                        name="endDate"
                                        minDate={new Date()}
                                        placeholder="expires on"
                                        value={endDate}
                                        iconPosition="left"
                                        required
                                        dateFormat="YYYY-MM-DD"
                                        onChange={this.handleChange} />
                                </Form.Field>
                                <Form.Field styleName='field-form'>
                                    <label>Description</label>
                                    <Form.Input
                                        autoComplete='off'
                                        name='details'
                                        onChange={this.handleChange}
                                        value={details}
                                        placeholder='Description of the product'
                                    />
                                </Form.Field>
                                <Form.Field required styleName='field-form'>
                                    <label>Price</label>
                                    <Form.Input
                                        autoComplete='off'
                                        name='cost'
                                        onChange={this.handleChange}
                                        value={cost}
                                        required
                                        placeholder='Price'
                                    />
                                </Form.Field>
                                {costError ?
                                    <Message
                                        error
                                        content='Maxium price can only be numeric value.'
                                    />
                                    : null
                                }
                                <Form.Field styleName='field-form'>
                                    <label>State of warranty</label>
                                    <Form.Input
                                        autoComplete='off'
                                        name='warrantyDetail'
                                        value={warrantyDetail}
                                        onChange={this.handleChange}
                                        placeholder='for eg. 3 months left'
                                    />
                                </Form.Field>
                                <Form.Field styleName='field-form'>
                                    <label>Email-id</label>
                                    <Form.Input
                                        readOnly
                                        value={user.person ? user.person.contactInformation.emailAddress : ''}
                                    />
                                </Form.Field>
                                <Form.Field styleName='field-form'>
                                    <Radio toggle
                                        label='Add phone number'
                                        name='isPhoneVisible'
                                        onChange={this.toggle}
                                        defaultChecked={item ? item.isPhoneVisible : false} />
                                </Form.Field>
                                {!item ?
                                    <Form.Field  styleName='field-form'>
                                        <label>Upload Images</label>
                                        <div styleName='img-add-div'>
                                            {!pictures[0] ?
                                                <UploadButton onChange={this.handleSelectPicture} count={'0'} styles={style} />
                                                :
                                                <div styleName='img-div'>
                                                    <Image styleName='upload-img' src={picturesUrl[0]} rounded />
                                                    <Icon onClick={(e) => this.hadleImgClose(e, 0)} key={0} circular inverted link name='close' styleName='close-btn' />
                                                </div>
                                            }
                                            {pictures[0] && !pictures[1] ?
                                                <UploadButton onChange={this.handleSelectPicture} count={'1'} styles={style} />
                                                : <>
                                                    {pictures[1] ?
                                                        <div styleName='img-div'>
                                                            <Image styleName='upload-img' src={picturesUrl[1]} rounded />
                                                            <Icon onClick={(e) => this.hadleImgClose(e, 1)} key={1} circular inverted link name='close' styleName='close-btn' />
                                                        </div>
                                                        : null
                                                    }
                                                </>
                                            }
                                            {pictures[0] && pictures[1] && !pictures[2] ?
                                                <UploadButton onChange={this.handleSelectPicture} count={'2'} styles={style} />
                                                : <>
                                                    {pictures[2] ?
                                                        <div styleName='img-div'>
                                                            <Image styleName='upload-img' src={picturesUrl[2]} rounded />
                                                            <Icon onClick={(e) => this.hadleImgClose(e, 2)} key={2} circular inverted link name='close' styleName='close-btn' />
                                                        </div>
                                                        : null
                                                    }
                                                </>
                                            }
                                        </div>
                                    </Form.Field>
                                    : null}
                                {!item ?
                                    <Form.Field>
                                        <Button
                                            type='submit'
                                            onClick={this.handleSubmit}
                                            disabled={formError}
                                            position='right'
                                            floated='right'
                                            color={getTheme()}
                                            icon
                                            labelPosition='left'
                                        >
                                            <Icon name='send' />
                                            Submit
                                    </Button>
                                    </Form.Field>
                                    : null}
                            </Form>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Grid.Column>
        )
    }
}
