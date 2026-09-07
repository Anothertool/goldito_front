import { useEffect, useMemo, useState } from 'react'
import {
    Box,
    Button,
    Flex,
    Grid,
    Heading,
    Image,
    Input,
    Spinner,
    Stack,
    Text,
    Textarea,
} from '@chakra-ui/react'
import { FormikProvider, getIn, useFormik } from 'formik'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
    PiArrowLeft,
    PiCamera,
    PiCheck,
    PiMinus,
    PiPlus,
    PiTag,
    PiX,
} from 'react-icons/pi'
import { componentsApi, recipeTagsApi, recipesApi } from '@/api'
import IngredientsField from '@/components/Ingredients/IngredientsField'
import MultiSelectField from '@/components/ui/MultiSelectField'
import {
    getRecipeInitialValues,
    toRecipePayload,
    validationSchema,
} from './utils'

const C = {
    ink: '#302d28',
    muted: '#777168',
    border: '#e7dfd3',
    green: '#559b55',
    greenDark: '#397c3d',
    greenSoft: '#e9f2df',
    danger: '#bd4d4d',
}
const getResults = (data) =>
    Array.isArray(data) ? data : (data?.results ?? [])
const invalid = (formik, name) =>
    Boolean(getIn(formik.touched, name) && getIn(formik.errors, name))
const control = (isInvalid = false) => ({
    w: '100%',
    color: C.ink,
    bg: 'rgba(255,253,249,.76)',
    borderColor: isInvalid ? C.danger : C.border,
    borderRadius: '10px',
    _focusVisible: {
        borderColor: isInvalid ? C.danger : '#86b47c',
        boxShadow: `0 0 0 3px ${isInvalid ? 'rgba(189,77,77,.1)' : 'rgba(86,157,83,.1)'}`,
    },
})
const smallControl = (isInvalid = false) => ({
    ...control(isInvalid),
    h: '38px',
    px: '8px',
    borderRadius: '8px',
    fontSize: '11px',
})

function normalizeErrors(value) {
    if (Array.isArray(value))
        return value.every((item) => typeof item !== 'object' || item === null)
            ? value.join(' ')
            : value.map(normalizeErrors)
    if (value && typeof value === 'object')
        return Object.fromEntries(
            Object.entries(value).map(([key, item]) => [
                key,
                normalizeErrors(item),
            ]),
        )
    return value == null ? '' : String(value)
}

function touchAll(value) {
    if (Array.isArray(value)) return value.map(touchAll)
    if (value && typeof value === 'object')
        return Object.fromEntries(
            Object.entries(value).map(([key, item]) => [key, touchAll(item)]),
        )
    return true
}

function firstError(value, prefix = '') {
    if (typeof value === 'string') return { message: value, path: prefix }
    if (!value || typeof value !== 'object') return null
    for (const [key, nested] of Object.entries(value)) {
        const result = firstError(nested, prefix ? `${prefix}.${key}` : key)
        if (result) return result
    }
    return null
}

function focusError(errors) {
    const path = firstError(errors)?.path
    if (!path) return
    requestAnimationFrame(() => {
        const bracketPath = path.replace(
            /\.\d+(?=\.|$)/g,
            (part) => `[${part.slice(1)}]`,
        )
        const field = [...document.querySelectorAll('[name]')].find((node) =>
            [path, bracketPath].some(
                (candidate) =>
                    node.name === candidate ||
                    node.name.startsWith(`${candidate}.`),
            ),
        )
        field?.focus()
    })
}

function ErrorText({ formik, name }) {
    const error = getIn(formik.errors, name)
    if (!getIn(formik.touched, name) || typeof error !== 'string') return null
    return (
        <Text mt="4px" color={C.danger} fontSize="11px" role="alert">
            {error}
        </Text>
    )
}

function FormField({ children, formik, label, name, optional }) {
    return (
        <Box minW="0">
            <Flex
                as="label"
                htmlFor={name}
                mb="6px"
                gap="4px"
                color="#37332e"
                fontSize="12px"
                fontWeight="750"
            >
                {label}
                {optional && (
                    <Text as="span" color="#969087" fontWeight="500">
                        (opcional)
                    </Text>
                )}
            </Flex>
            {children}
            {name && <ErrorText formik={formik} name={name} />}
        </Box>
    )
}

const AddButton = (props) => (
    <Button
        type="button"
        mt="8px"
        px="8px"
        py="3px"
        h="auto"
        color={C.greenDark}
        bg="transparent"
        fontSize="12px"
        fontWeight="650"
        {...props}
    />
)

function RecipeForm() {
    const navigate = useNavigate()
    const location = useLocation()
    const { recipeId } = useParams()
    const isEditing = Boolean(recipeId)
    const returnTo = location.state?.returnTo ?? '/recetas'
    const returnState = location.state?.returnState
    const navigateBack = () => navigate(returnTo, { state: returnState })
    const [newTagName, setNewTagName] = useState('')
    const [tagCreatorOpen, setTagCreatorOpen] = useState(false)
    const [imagePreview, setImagePreview] = useState('')
    const [persistedRecipeId, setPersistedRecipeId] = useState(null)

    useEffect(
        () => () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview)
        },
        [imagePreview],
    )

    const recipeQuery = useQuery(recipesApi.queries.detail(recipeId))
    const tagsQuery = useQuery(
        recipeTagsApi.queries.list({ page_size: 100, ordering: 'name' }),
    )
    const componentsQuery = useQuery(
        componentsApi.queries.list({
            page_size: 100,
            ordering: 'name',
            is_active: true,
        }),
    )
    const createRecipe = useMutation(recipesApi.mutations.create())
    const updateRecipe = useMutation(recipesApi.mutations.partialUpdate())
    const createTag = useMutation(recipeTagsApi.mutations.create())
    const tags = getResults(tagsQuery.data)
    const components = getResults(componentsQuery.data)
    const initialValues = useMemo(
        () => getRecipeInitialValues(recipeQuery.data),
        [recipeQuery.data],
    )

    const formik = useFormik({
        initialValues,
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values, helpers) => {
            helpers.setStatus(null)
            const targetId = recipeId ?? persistedRecipeId
            let createdNow = false
            try {
                const saved = targetId
                    ? await updateRecipe.mutateAsync({
                          id: targetId,
                          data: toRecipePayload(values),
                      })
                    : await createRecipe.mutateAsync(toRecipePayload(values))
                if (!targetId) {
                    createdNow = true
                    setPersistedRecipeId(saved.id)
                }
                if (values.image) {
                    const imageData = new FormData()
                    imageData.append('image', values.image)
                    await updateRecipe.mutateAsync({
                        id: saved.id ?? targetId,
                        data: imageData,
                    })
                }
                navigateBack()
            } catch (error) {
                const errors = normalizeErrors(error.response?.data)
                const fieldErrors =
                    errors && typeof errors === 'object' ? errors : {}
                helpers.setErrors(fieldErrors)
                helpers.setStatus(
                    createdNow && fieldErrors.image
                        ? 'La receta se ha guardado, pero no se pudo subir la imagen. Pulsa Guardar para reintentar.'
                        : (firstError(errors)?.message ??
                              'No se ha podido guardar la receta. Revisa los datos e inténtalo de nuevo.'),
                )
                focusError(fieldErrors)
            }
        },
    })

    const submit = async (event) => {
        event.preventDefault()
        const errors = await formik.validateForm()
        if (Object.keys(errors).length) {
            await formik.setTouched(touchAll(formik.values), false)
            formik.setStatus(
                'Hay campos con errores. Revísalos antes de guardar.',
            )
            focusError(errors)
            return
        }
        await formik.submitForm()
    }

    const createNewTag = async () => {
        const name = newTagName.trim()
        if (!name) return
        try {
            const tag = await createTag.mutateAsync({ name })
            formik.setFieldValue('tags', [...formik.values.tags, tag.id])
            setNewTagName('')
            setTagCreatorOpen(false)
        } catch {
            /* useMutation expone el error debajo del campo */
        }
    }
    const selectedTags = formik.values.tags.map(
        (id) =>
            tags.find((tag) => Number(tag.id) === Number(id)) ?? {
                id,
                name: `Etiqueta ${id}`,
            },
    )
    const isSaving = createRecipe.isPending || updateRecipe.isPending
    const photo = imagePreview || recipeQuery.data?.image_url

    if (isEditing && recipeQuery.isPending)
        return (
            <Flex
                minH="100dvh"
                align="center"
                justify="center"
                gap="10px"
                color={C.muted}
            >
                <Spinner size="sm" color={C.green} />
                <Text>Cargando receta…</Text>
            </Flex>
        )
    if (isEditing && recipeQuery.isError)
        return (
            <Flex
                minH="100dvh"
                direction="column"
                align="center"
                justify="center"
                gap="10px"
                color={C.muted}
            >
                <Text>No hemos podido abrir esta receta.</Text>
                <Button bg={C.green} color="white" onClick={navigateBack}>
                    Volver al listado
                </Button>
            </Flex>
        )

    return (
        <FormikProvider value={formik}>
            <Box minH="100%" pb="38px" color={C.ink} bg="#fdf8ef">
                <Flex
                    as="header"
                    position="sticky"
                    zIndex="8"
                    top="0"
                    h="70px"
                    align="center"
                    justify="space-between"
                    px="18px"
                    py="10px"
                    bg="rgba(253,248,239,.94)"
                    borderBottom="1px solid rgba(231,223,211,.8)"
                    backdropFilter="blur(10px)"
                >
                    <Button
                        type="button"
                        minW="34px"
                        w="34px"
                        h="34px"
                        p="0"
                        color={C.ink}
                        bg="transparent"
                        aria-label="Volver"
                        onClick={navigateBack}
                    >
                        <PiArrowLeft />
                    </Button>
                    <Heading as="h1" fontSize="18px" letterSpacing="-.035em">
                        {isEditing ? 'Editar receta' : 'Crear receta'}
                    </Heading>
                    <Button
                        type="submit"
                        form="recipe-form"
                        minW="68px"
                        px="5px"
                        color={C.greenDark}
                        bg="transparent"
                        fontSize="13px"
                        fontWeight="750"
                        disabled={isSaving}
                    >
                        {isSaving ? 'Guardando…' : 'Guardar'}
                    </Button>
                </Flex>

                <Grid
                    as="form"
                    id="recipe-form"
                    noValidate
                    gap="17px"
                    px={{ base: '15px', sm: '22px' }}
                    pt="18px"
                    onSubmit={submit}
                >
                    <Box>
                        <Flex
                            as="label"
                            position="relative"
                            h="126px"
                            align="center"
                            justify="center"
                            overflow="hidden"
                            bg={photo ? '#e8e3da' : 'rgba(255,255,255,.38)'}
                            border="2px dashed"
                            borderStyle={photo ? 'solid' : 'dashed'}
                            borderColor={
                                invalid(formik, 'image') ? C.danger : '#ccc4b8'
                            }
                            borderRadius="13px"
                            cursor="pointer"
                            _hover={{
                                borderColor: '#86b47c',
                                boxShadow: '0 0 0 3px rgba(86,157,83,.1)',
                            }}
                        >
                            <Input
                                position="absolute"
                                w="1px"
                                h="1px"
                                opacity="0"
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={(event) => {
                                    const file =
                                        event.currentTarget.files?.[0] ?? null
                                    formik.setFieldValue('image', file)
                                    formik.setFieldTouched('image', true, false)
                                    setImagePreview(
                                        file ? URL.createObjectURL(file) : '',
                                    )
                                }}
                            />
                            {photo && (
                                <Image
                                    w="100%"
                                    h="100%"
                                    objectFit="cover"
                                    src={photo}
                                    alt="Vista previa de la receta"
                                />
                            )}
                            <Flex
                                position="absolute"
                                inset="0"
                                top={photo ? 'auto' : '0'}
                                minH={photo ? '58px' : undefined}
                                direction="column"
                                align="center"
                                justify={photo ? 'flex-end' : 'center'}
                                py={photo ? '7px' : '0'}
                                color={photo ? 'white' : C.muted}
                                bg={
                                    photo
                                        ? 'linear-gradient(transparent,rgba(37,32,26,.78))'
                                        : 'transparent'
                                }
                            >
                                <Box fontSize={photo ? '20px' : '35px'}>
                                    <PiCamera />
                                </Box>
                                <Text as="strong" fontSize="12px">
                                    {photo ? 'Cambiar foto' : 'Añadir foto'}
                                </Text>
                                {!photo && (
                                    <Text fontSize="10px" color="#a19a91">
                                        JPG, PNG, WEBP… Máximo 10 MB
                                    </Text>
                                )}
                            </Flex>
                        </Flex>
                        <ErrorText formik={formik} name="image" />
                    </Box>

                    <FormField
                        formik={formik}
                        label="Nombre de la receta"
                        name="name"
                    >
                        <Input
                            {...control(invalid(formik, 'name'))}
                            id="name"
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Ej: Curry de pollo con arroz"
                            maxLength={150}
                            aria-invalid={invalid(formik, 'name')}
                        />
                    </FormField>
                    <FormField
                        formik={formik}
                        label="Descripción"
                        name="description"
                        optional
                    >
                        <Textarea
                            {...control()}
                            id="description"
                            name="description"
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Una breve descripción de la receta"
                            rows={3}
                        />
                    </FormField>

                    <Box as="fieldset" m="0" p="0" border="0">
                        <Text
                            as="legend"
                            mb="6px"
                            fontSize="12px"
                            fontWeight="750"
                        >
                            Tipo de comida
                        </Text>
                        <Grid templateColumns="repeat(3,1fr)" gap="8px">
                            {[
                                ['lunch', 'Comida'],
                                ['dinner', 'Cena'],
                                ['', 'Ambas'],
                            ].map(([value, label]) => {
                                const selected =
                                    formik.values.meal_type === value
                                return (
                                    <Button
                                        key={label}
                                        type="button"
                                        h="43px"
                                        color={selected ? '#3e6737' : '#4c4841'}
                                        bg={
                                            selected
                                                ? C.greenSoft
                                                : 'rgba(255,253,249,.72)'
                                        }
                                        border="1px solid"
                                        borderColor={
                                            selected ? '#c8d9b8' : C.border
                                        }
                                        borderRadius="10px"
                                        fontSize="12px"
                                        onClick={() =>
                                            formik.setFieldValue(
                                                'meal_type',
                                                value,
                                            )
                                        }
                                    >
                                        {label}
                                    </Button>
                                )
                            })}
                        </Grid>
                    </Box>

                    <Grid
                        templateColumns={{ base: '1fr', sm: '1fr 1fr' }}
                        gap="12px"
                    >
                        <FormField
                            formik={formik}
                            label="Raciones"
                            name="servings"
                        >
                            <Grid
                                h="44px"
                                templateColumns="38px 1fr 38px"
                                alignItems="center"
                                bg="rgba(255,253,249,.76)"
                                border="1px solid"
                                borderColor={
                                    invalid(formik, 'servings')
                                        ? C.danger
                                        : C.border
                                }
                                borderRadius="10px"
                            >
                                <Button
                                    type="button"
                                    minW="25px"
                                    w="25px"
                                    h="25px"
                                    m="auto"
                                    p="0"
                                    color={C.greenDark}
                                    bg="#f7fbf3"
                                    border="1px solid #9ec695"
                                    aria-label="Restar una ración"
                                    onClick={() =>
                                        formik.setFieldValue(
                                            'servings',
                                            Math.max(
                                                1,
                                                Number(formik.values.servings) -
                                                    1,
                                            ),
                                        )
                                    }
                                >
                                    <PiMinus />
                                </Button>
                                <Input
                                    id="servings"
                                    name="servings"
                                    type="number"
                                    min="1"
                                    h="40px"
                                    p="0"
                                    value={formik.values.servings}
                                    textAlign="center"
                                    bg="transparent"
                                    border="0"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                <Button
                                    type="button"
                                    minW="25px"
                                    w="25px"
                                    h="25px"
                                    m="auto"
                                    p="0"
                                    color={C.greenDark}
                                    bg="#f7fbf3"
                                    border="1px solid #9ec695"
                                    aria-label="Añadir una ración"
                                    onClick={() =>
                                        formik.setFieldValue(
                                            'servings',
                                            Number(
                                                formik.values.servings || 0,
                                            ) + 1,
                                        )
                                    }
                                >
                                    <PiPlus />
                                </Button>
                            </Grid>
                        </FormField>
                        <FormField
                            formik={formik}
                            label="Tiempo activo (min)"
                            name="active_time_minutes"
                        >
                            <Input
                                {...control(
                                    invalid(formik, 'active_time_minutes'),
                                )}
                                id="active_time_minutes"
                                name="active_time_minutes"
                                type="number"
                                min="0"
                                value={formik.values.active_time_minutes}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="30"
                            />
                        </FormField>
                    </Grid>

                    <FormField formik={formik} label="Etiquetas" name="tags">
                        <MultiSelectField
                            inputId="tags"
                            instanceId="recipe-tags"
                            name="tags"
                            options={tags.map((tag) => ({
                                value: Number(tag.id),
                                label: tag.name,
                            }))}
                            value={selectedTags.map((tag) => ({
                                value: Number(tag.id),
                                label: tag.name,
                            }))}
                            onChange={(options) =>
                                formik.setFieldValue(
                                    'tags',
                                    options.map((option) => option.value),
                                )
                            }
                            onBlur={() => formik.setFieldTouched('tags', true)}
                            isLoading={tagsQuery.isFetching}
                            invalid={invalid(formik, 'tags')}
                            placeholder="Seleccionar etiquetas?"
                        />
                        {!tagCreatorOpen ? (
                            <AddButton onClick={() => setTagCreatorOpen(true)}>
                                <PiTag /> Crear etiqueta nueva
                            </AddButton>
                        ) : (
                            <Grid
                                mt="7px"
                                templateColumns="1fr 40px 40px"
                                gap="6px"
                            >
                                <Input
                                    {...control()}
                                    value={newTagName}
                                    onChange={(event) =>
                                        setNewTagName(event.target.value)
                                    }
                                    placeholder="Nombre de la etiqueta"
                                    maxLength={100}
                                />
                                <Button
                                    type="button"
                                    p="0"
                                    color={C.greenDark}
                                    bg="#f8fbf5"
                                    border="1px solid #a7c99d"
                                    disabled={
                                        !newTagName.trim() ||
                                        createTag.isPending
                                    }
                                    aria-label="Crear etiqueta"
                                    onClick={createNewTag}
                                >
                                    <PiCheck />
                                </Button>
                                <Button
                                    type="button"
                                    p="0"
                                    color="#8d655f"
                                    bg="#fff8f6"
                                    border="1px solid #dfc2bc"
                                    aria-label="Cancelar"
                                    onClick={() => setTagCreatorOpen(false)}
                                >
                                    <PiX />
                                </Button>
                            </Grid>
                        )}
                        {createTag.isError && (
                            <Text
                                mt="4px"
                                color={C.danger}
                                fontSize="11px"
                                role="alert"
                            >
                                No se ha podido crear la etiqueta.
                            </Text>
                        )}
                    </FormField>

                    <IngredientsField formik={formik} />

                    <Box
                        as="section"
                        p="3"
                        bg="rgba(255,253,249,.48)"
                        border="1px solid"
                        borderColor={C.border}
                        borderRadius="12px"
                    >
                        <Text
                            as="label"
                            htmlFor="recipe-components"
                            display="block"
                            fontSize="12px"
                            fontWeight="700"
                            mb="2"
                        >
                            Componentes utilizados
                        </Text>
                        <MultiSelectField
                            inputId="recipe-components"
                            instanceId="recipe-components"
                            name="components"
                            options={components
                                .filter((item) => item.is_active !== false)
                                .map((item) => ({
                                    value: Number(item.id),
                                    label: item.name,
                                }))}
                            value={formik.values.components.map((item) => ({
                                value: Number(item.component_id),
                                label:
                                    components.find(
                                        (entry) =>
                                            Number(entry.id) ===
                                            Number(item.component_id),
                                    )?.name ??
                                    recipeQuery.data?.components?.find(
                                        (entry) =>
                                            Number(
                                                entry.component_id ??
                                                    entry.component?.id ??
                                                    entry.id,
                                            ) === Number(item.component_id),
                                    )?.component?.name ??
                                    'Componente ' + item.component_id,
                            }))}
                            onChange={(options) => {
                                formik.setFieldValue(
                                    'components',
                                    options.map(
                                        (option) =>
                                            formik.values.components.find(
                                                (item) =>
                                                    Number(
                                                        item.component_id,
                                                    ) === option.value,
                                            ) ?? {
                                                component_id: option.value,
                                                portions: 1,
                                            },
                                    ),
                                )
                                formik.setFieldTouched(
                                    'components',
                                    false,
                                    false,
                                )
                            }}
                            onBlur={() =>
                                formik.setFieldTouched('components', true)
                            }
                            isLoading={componentsQuery.isFetching}
                            invalid={invalid(formik, 'components')}
                            placeholder="Seleccionar componentes?"
                        />
                        <ErrorText formik={formik} name="components" />
                        <Stack gap="2" mt="3">
                            {formik.values.components.map((item, index) => (
                                <Flex
                                    key={item.component_id}
                                    align="start"
                                    gap="3"
                                >
                                    <Text flex="1" fontSize="12px" pt="2">
                                        {components.find(
                                            (entry) =>
                                                Number(entry.id) ===
                                                Number(item.component_id),
                                        )?.name ??
                                            'Componente ' + item.component_id}
                                    </Text>
                                    <Box w="110px">
                                        <Input
                                            {...smallControl(
                                                invalid(
                                                    formik,
                                                    'components.' +
                                                        index +
                                                        '.portions',
                                                ),
                                            )}
                                            name={
                                                'components.' +
                                                index +
                                                '.portions'
                                            }
                                            type="number"
                                            min="0"
                                            step="0.25"
                                            value={item.portions}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            aria-label={
                                                'Porciones del componente ' +
                                                (index + 1)
                                            }
                                        />
                                        <Text fontSize="10px" color={C.muted}>
                                            Porciones
                                        </Text>
                                        <ErrorText
                                            formik={formik}
                                            name={
                                                'components.' +
                                                index +
                                                '.portions'
                                            }
                                        />
                                    </Box>
                                </Flex>
                            ))}
                        </Stack>
                        <Text mt="2" color={C.muted} fontSize="11px">
                            Los componentes nuevos deben crearse antes desde la
                            secci?n Componentes.
                        </Text>
                    </Box>

                    <FormField
                        formik={formik}
                        label="Instrucciones"
                        name="instructions"
                    >
                        <Textarea
                            {...control()}
                            id="instructions"
                            name="instructions"
                            value={formik.values.instructions}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Describe los pasos para preparar la receta…"
                            rows={6}
                        />
                    </FormField>
                    <Flex
                        as="label"
                        position="relative"
                        align="center"
                        justify="space-between"
                        gap="14px"
                        p="12px 13px"
                        bg="rgba(255,253,249,.54)"
                        border="1px solid"
                        borderColor={C.border}
                        borderRadius="11px"
                        cursor="pointer"
                    >
                        <Grid>
                            <Text as="strong" fontSize="12px">
                                Receta activa
                            </Text>
                            <Text fontSize="10px" color={C.muted}>
                                Estará disponible para planificar comidas.
                            </Text>
                        </Grid>
                        <Input
                            position="absolute"
                            w="1px"
                            h="1px"
                            opacity="0"
                            type="checkbox"
                            name="is_active"
                            checked={formik.values.is_active}
                            onChange={formik.handleChange}
                        />
                        <Flex
                            w="40px"
                            h="23px"
                            align="center"
                            justify={
                                formik.values.is_active
                                    ? 'flex-end'
                                    : 'flex-start'
                            }
                            p="3px"
                            bg={formik.values.is_active ? C.green : '#cfc9c0'}
                            borderRadius="20px"
                        >
                            <Box
                                w="17px"
                                h="17px"
                                bg="white"
                                borderRadius="50%"
                                boxShadow="0 1px 3px rgba(0,0,0,.15)"
                            />
                        </Flex>
                    </Flex>
                    {formik.status && (
                        <Box
                            p="10px 12px"
                            color="#9c4141"
                            bg="#fff0ed"
                            border="1px solid #edc4bd"
                            borderRadius="9px"
                            fontSize="11px"
                            role="alert"
                        >
                            {formik.status}
                        </Box>
                    )}
                    <Button
                        type="submit"
                        h="47px"
                        color="white"
                        bg="linear-gradient(145deg,#63a95e,#408746)"
                        borderRadius="11px"
                        boxShadow="0 7px 18px rgba(60,124,62,.22)"
                        fontSize="13px"
                        fontWeight="750"
                        disabled={isSaving}
                    >
                        {isSaving
                            ? 'Guardando receta…'
                            : isEditing
                              ? 'Guardar cambios'
                              : 'Crear receta'}
                    </Button>
                </Grid>
            </Box>
        </FormikProvider>
    )
}

export default RecipeForm
