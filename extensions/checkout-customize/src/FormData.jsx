import {
    reactExtension,
    Banner,
    BlockStack,
    Checkbox,
    Text,
    useApi,
    useApplyAttributeChange,
    useInstructions,
    useTranslate,
  } from "@shopify/ui-extensions-react/checkout"; 

  export default reactExtension(
    "purchase.checkout.delivery-address.render-after",
     () => <FormData />
  );

  function FormData () {
    const [contentType, setContentType] = useState('plain');
    const [fontSize, setFontSize] = useState('medium');
    const [descriptionAlignment, setDescriptionAlignment] = useState('left');
    const [isCollapsed, setIsCollapsed] = useState(true);
  
    const handleCollapseToggle = () => {
      setIsCollapsed(!isCollapsed);
    };
  
    return (
        <BlockStack inlineAlignment="center">
        <Text size="extraSmall">Total</Text>
        <Text size="small">Total</Text>
        <Text size="base">Total</Text>
        <Text size="medium">Total</Text>
        <Text size="large">Total</Text>
        <Text size="extraLarge">Total</Text>
      </BlockStack>
    );
  };
  